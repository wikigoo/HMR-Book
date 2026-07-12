---
title: Step by step installation - SearXNG Documentation (2026.7.3+747cec4c2)
description: Step-by-step SearXNG installation guide.
source: https://docs.searxng.org/admin/installation-searxng.html#installation-basic
---
## Step by step installation

In this section we show the setup of a SearXNG instance that will be installed by the [Installation Script](https://docs.searxng.org/admin/installation-scripts.html#installation-scripts).

## Install packages

```sh
$ sudo -H apt-get install -y \
    python3-dev python3-babel python3-venv python-is-python3 \
    uwsgi uwsgi-plugin-python3 \
    git build-essential libxslt-dev zlib1g-dev libffi-dev libssl-dev
```

> [!note] Hint
> This installs also the packages needed by [uWSGI](https://docs.searxng.org/admin/installation-uwsgi.html#searxng-uwsgi)

## Create user

```sh
$ sudo -H useradd --shell /bin/bash --system \
    --home-dir "/usr/local/searxng" \
    --comment 'Privacy-respecting metasearch engine' \
    searxng

$ sudo -H mkdir "/usr/local/searxng"
$ sudo -H chown -R "searxng:searxng" "/usr/local/searxng"
```

## Install SearXNG & dependencies

Start a interactive shell from new created user and clone SearXNG:

```sh
$ sudo -H -u searxng -i
(searxng)$ git clone "https://github.com/searxng/searxng" \
                   "/usr/local/searxng/searxng-src"
```

In the same shell create *virtualenv*:

```sh
(searxng)$ python3 -m venv "/usr/local/searxng/searx-pyenv"
(searxng)$ echo ". /usr/local/searxng/searx-pyenv/bin/activate" \
                   >>  "/usr/local/searxng/.profile"
```

To install SearXNG’s dependencies, exit the SearXNG *bash* session you opened above and start a new one. Before installing, check if your *virtualenv* was sourced from the login (*~/.profile*):

```sh
$ sudo -H -u searxng -i

(searxng)$ command -v python && python --version
/usr/local/searxng/searx-pyenv/bin/python
Python 3.11.10

# update pip's boilerplate ..
pip install -U pip
pip install -U setuptools
pip install -U wheel

# additional packages required for installation
pip install -U pyyaml
pip install -U msgspec
pip install -U typing-extensions
pip install -U pybind11

# jump to SearXNG's working tree and install SearXNG into virtualenv
(searxng)$ cd "/usr/local/searxng/searxng-src"
(searxng)$ pip install --use-pep517 --no-build-isolation -e .
```

> [!tip] Tip
> Open a second terminal for the configuration tasks and leave the `(searx)$` terminal open for the tasks below.

## Configuration

To create a initial `/etc/searxng/settings.yml` we recommend to start with a copy of the file [git://utils/templates/etc/searxng/settings.yml](https://github.com/searxng/searxng/blob/master/utils/templates/etc/searxng/settings.yml). This setup [use default settings](https://docs.searxng.org/admin/settings/settings.html#settings-use-default-settings) from [git://searx/settings.yml](https://github.com/searxng/searxng/blob/master/searx/settings.yml) and is shown in the tab *“Use default settings”* below. This setup:

- enables [limiter](https://docs.searxng.org/admin/searx.limiter.html#limiter) to protect against bots
- enables [image proxy](https://docs.searxng.org/admin/settings/settings_server.html#image-proxy) for better privacy

Modify the `/etc/searxng/settings.yml` to your needs:

```yaml
# SearXNG settings

use_default_settings: true

general:
  debug: false
  instance_name: "SearXNG"

search:
  safe_search: 2
  autocomplete: 'duckduckgo'
  formats:
    - html

server:
  # Is overwritten by ${SEARXNG_SECRET}
  secret_key: "ultrasecretkey"
  limiter: true
  image_proxy: true
  # public URL of the instance, to ensure correct inbound links. Is overwritten
  # by ${SEARXNG_BASE_URL}.
  # base_url: http://example.com/location

valkey:
  # URL to connect valkey database. Is overwritten by ${SEARXNG_VALKEY_URL}.
  url: valkey://localhost:6379/0
```

To see the entire file jump to [git://utils/templates/etc/searxng/settings.yml](https://github.com/searxng/searxng/blob/master/utils/templates/etc/searxng/settings.yml)

For a *minimal setup* you need to set `server:secret_key`.

```sh
$ sudo -H mkdir -p "/etc/searxng"
$ sudo -H cp "/usr/local/searxng/searxng-src/utils/templates/etc/searxng/settings.yml" \
             "/etc/searxng/settings.yml"
```

## Check

To check your SearXNG setup, optional enable debugging and start the *webapp*. SearXNG looks at the exported environment `$SEARXNG_SETTINGS_PATH` for a configuration file.

```sh
# enable debug ..
$ sudo -H sed -i -e "s/debug : False/debug : True/g" "/etc/searxng/settings.yml"

# start webapp
$ sudo -H -u searxng -i
(searxng)$ cd /usr/local/searxng/searxng-src
(searxng)$ export SEARXNG_SETTINGS_PATH="/etc/searxng/settings.yml"
(searxng)$ python -m searx.webapp

# disable debug
$ sudo -H sed -i -e "s/debug : True/debug : False/g" "/etc/searxng/settings.yml"
```

Open WEB browser and visit [http://127.0.0.1:8888](http://127.0.0.1:8888/). If you are inside a container or in a script, test with curl:

```sh
$ xdg-open http://127.0.0.1:8888
```

If everything works fine, hit `[CTRL-C]` to stop the *webapp* and disable the debug option in `settings.yml`. You can now exit SearXNG user bash session (enter exit command twice). At this point SearXNG is not demonized; uwsgi allows this.