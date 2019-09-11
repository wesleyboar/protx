"""
Django settings for portal project.

Generated by 'django-admin startproject' using Django 1.10.5.

For more information on this file, see
https://docs.djangoproject.com/en/1.10/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.10/ref/settings/
"""

import os

#pylint: disable=invalid-name
gettext = lambda s: s
#pylint: enable=invalid-name

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.10/howto/deployment/checklist/

SITE_ID = 1
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '__CHANGE_ME!__'
# SECURITY WARNING: don't run with debug turned on in production!
#Cookie name. this can be whatever you want
SESSION_COOKIE_NAME='sessionid'  # use the sessionid in your views code
#the module to store sessions data
SESSION_ENGINE='django.contrib.sessions.backends.db'
#age of cookie in seconds (default: 2 weeks)
SESSION_COOKIE_AGE= 24*60*60*7 # the number of seconds for only 7 for example
#whether a user's session cookie expires when the web browser is closed
SESSION_EXPIRE_AT_BROWSER_CLOSE=False
#whether the session cookie should be secure (https:// only)
SESSION_COOKIE_SECURE=False

ALLOWED_HOSTS = ['*']

# Custom Portal Template Assets
PORTAL_ICON_FILENAME='path/to/icon.ico'
PORTAL_LOGO_FILENAME='path/to/logo.png'
PORTAL_NAVBAR_BACKGROUND_FILENAME='path/to/background.png'
PORTAL_DOMAIN = 'test.portal'
PORTAL_ADMIN_USERNAME = 'wma_prtl'

# Application definition

ROOT_URLCONF = 'portal.urls'


INSTALLED_APPS = [
    'djangocms_admin_style',  # Order-dependent requirement for CMS. Must precede 'django.contrib.admin'.

    # Core Django.
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sessions.middleware',
    'django.contrib.admin',
    'django.contrib.sites',                         # CMS
    'django.contrib.sitemaps',
    'django.contrib.staticfiles',
    'django.contrib.messages',

    # Django CMS.
    # CMS plugins that must be before 'cms'.
    'cmsplugin_cascade',

    # - CMS minimum requirements.
    'cms',
    'menus',
    'sekizai',
    'treebeard',

    # - CMS remaining plugins.
    'djangocms_text_ckeditor',

    # 'forms_builder.forms',                          # django-forms-builder


    'aldryn_bootstrap3',
    'captcha',                                        # Aldryn-forms
    'filer',
    'easy_thumbnails',

    'djangocms_audio',
    'djangocms_forms',
    'djangocms_googlemap',
    'djangocms_snippet',
    'djangocms_style',
    'djangocms_youtube',
    'djangocms_video',

    'cmsplugin_filer_file',
    'cmsplugin_filer_folder',
    'cmsplugin_filer_link',
    'cmsplugin_filer_image',
    'cmsplugin_filer_teaser',
    'cmsplugin_filer_video',
    'cmsplugin_iframe',  # edit template here: /usr/lib/python2.7/site-packages/cmsplugin_iframe/templates/cms/plugins
    'cmsplugin_socialsharekit',

    # Django recaptcha.
    'snowpenguin.django.recaptcha2',

    # Pipeline.
    'mptt',
    'bootstrap3',
    'termsandconditions',
    'impersonate',

    # Websockets.
    'ws4redis',

    # Haystack integration.
    'haystack',

    # Custom apps.
    'portal.apps.accounts',
    'portal.apps.auth',
    'portal.apps.data_depot',
    'portal.apps.workspace',
    'portal.apps.signals',
    'portal.apps.search',
    'portal.apps.workbench',
    'portal.apps.djangoRT',
    'portal.apps.projects',
    'portal.apps.licenses',
    'portal.apps.notifications',
    'portal.apps.onboarding',
    'portal.apps.public_data',
    'portal.apps.googledrive_integration'
]

MIDDLEWARE = [
    'cms.middleware.utils.ApphookReloadMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'portal.apps.auth.middleware.AgaveTokenRefreshMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'cms.middleware.user.CurrentUserMiddleware',
    'cms.middleware.page.CurrentPageMiddleware',
    'cms.middleware.toolbar.ToolbarMiddleware',
    'cms.middleware.language.LanguageCookieMiddleware',

    # Throws an Error.
    # 'portal.middleware.PortalTermsMiddleware',
]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'sekizai.context_processors.sekizai',
                'cms.context_processors.cms_settings',
                'portal.utils.contextprocessors.analytics',
                'portal.utils.contextprocessors.debug',
                'portal.utils.contextprocessors.messages',
            ],
            'libraries':{
                'sd2e_nav_tags': 'portal.templatetags.sd2e_nav_tags',

            }
        },
    },
]

WSGI_APPLICATION = 'portal.wsgi.application'

AUTHENTICATION_BACKENDS = ['django.contrib.auth.backends.ModelBackend']

# Password validation
# https://docs.djangoproject.com/en/1.10/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

REQUEST_ACCESS = True

IMPERSONATE_REQUIRE_SUPERUSER = True

LOGIN_REDIRECT_URL = '/index/'

# Internationalization
# https://docs.djangoproject.com/en/1.10/topics/i18n/

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

CMS_TEMPLATES = (
    ('cms_page.html', 'Main Site Page'),
)

LANGUAGES = [
    ('en-us', 'US English')
]
# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.10/howto/static-files/

STATIC_URL = '/static/'
MEDIA_URL = '/media/'

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
    ('vendor', os.path.join(BASE_DIR, '../node_modules')),
]

FIXTURE_DIRS = [
    os.path.join(BASE_DIR, 'fixtures'),
]

STATICFILES_FINDERS = [
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': 'test'
    }
}

ALLOCATION_SYSTEMS = [ ]

PORTAL_NAMESPACE='test'

PORTAL_DATA_DEPOT_DEFAULT_HOME_DIR_ABS_PATH = '/path/to/home_dirs'
PORTAL_DATA_DEPOT_WORK_HOME_DIR_FS = '/work'
PORTAL_DATA_DEPOT_WORK_HOME_DIR_EXEC_SYSTEM = 'stampede2'
# Relative path from the default sotrage system where home directories
# should be created.
# Use only if all home directories are under one parent directory.
PORTAL_DATA_DEPOT_DEFAULT_HOME_DIR_REL_PATH = 'home_dirs'
PORTAL_DATA_DEPOT_USER_SYSTEM_PREFIX = 'cep.home.{}'
PORTAL_DATA_DEPOT_STORAGE_HOST = 'data.tacc.utexas.edu'

PORTAL_DATA_DEPOT_PROJECT_SYSTEM_PREFIX = 'cep.project'

PORTAL_USER_HOME_MANAGER = 'portal.apps.accounts.managers.user_home.UserHomeManager'
PORTAL_KEYS_MANAGER = 'portal.apps.accounts.managers.ssh_keys.KeysManager'
PORTAL_PROJECTS_PEMS_APP_ID = 'pems.app-test'

PORTAL_PROJECTS_NAME_PREFIX = 'cep.project'

PORTAL_PROJECTS_ID_PREFIX = 'cep.project'

PORTAL_PROJECTS_ROOT_DIR = '/path/to/root'

PORTAL_PROJECTS_ROOT_SYSTEM_NAME = 'projects.system.name'

PORTAL_PROJECTS_ROOT_HOST = 'host.for.projects'

PORTAL_PROJECTS_SYSTEM_PORT = 22

PORTAL_PROJECTS_PRIVATE_KEY = ('-----BEGIN RSA PRIVATE KEY-----'
                               'change this'
                               '-----END RSA PRIVATE KEY-----')
PORTAL_PROJECTS_PUBLIC_KEY = 'ssh-rsa change this'

PORTAL_USER_ACCOUNT_SETUP_STEPS = [
    'portal.apps.accounts.steps.test_steps.MockStep'
]
PORTAL_USER_ACCOUNT_SETUP_WEBHOOK_PWD = 'dev'

PORTAL_DATA_DEPOT_MANAGERS = {
    'my-data': 'portal.apps.data_depot.managers.private_data.FileManager',
    'shared': 'portal.apps.data_depot.managers.shared.FileManager',
    'my-projects': 'portal.apps.data_depot.managers.projects.FileManager',
    'google-drive': 'portal.apps.data_depot.managers.google_drive.FileManager'
}

PORTAL_SEARCH_MANAGERS = {
    'my-data': 'portal.apps.search.api.managers.private_data_search.PrivateDataSearchManager',
    'shared': 'portal.apps.search.api.managers.shared_search.SharedSearchManager',
    'cms': 'portal.apps.search.api.managers.cms_search.CMSSearchManager',
    # 'my-projects': 'portal.apps.data_depot.managers.projects.FileManager'
}

EXTERNAL_RESOURCE_SECRETS = {
    "google-drive": {
        "client_secret": "test",
        "client_id": "test",
        "name": "Google Drive",
        "directory": "external-resources"
    }
}

PORTAL_DATA_DEPOT_PAGE_SIZE = 100

PORTAL_WORKSPACE_MANAGERS = {
    'private': 'portal.apps.workspace.managers.private.FileManager',
    'shared': 'portal.apps.workspace.managers.shared.FileManager',
}
PORTAL_WORKSPACE_PAGE_SIZE = 100
# TAS Authentication.
TAS_URL = 'test.com'
TAS_CLIENT_KEY = 'test'
TAS_CLIENT_SECRET = 'test'
# Redmine Tracker Authentication.
RT_URL = 'test'
RT_HOST = 'https://test.com'
RT_UN = 'test'
RT_PW = 'test'
RT_QUEUE = 'test'
RT_TAG = 'test_tag'

# Agave Tenant.
AGAVE_TENANT_ID = 'portal'
AGAVE_TENANT_BASEURL = 'https://api.example.com'

# Agave Client Configuration
AGAVE_CLIENT_KEY = 'test'
AGAVE_CLIENT_SECRET = 'test'
AGAVE_SUPER_TOKEN = 'test'
AGAVE_STORAGE_SYSTEM = 'test'
AGAVE_COMMUNITY_DATA_SYSTEM = 'test.storage'
AGAVE_PUBLIC_DATA_SYSTEM = 'test.public'
AGAVE_DEFAULT_TRASH_NAME = 'test'

AGAVE_JWT_HEADER = 'HTTP_X_AGAVE_HEADER'
AGAVE_JWT_ISSUER = 'wso2.org/products/am'
AGAVE_JWT_USER_CLAIM_FIELD = 'http://wso2.org/claims/fullname'

ES_HOSTS = ['test.com']
ES_DEFAULT_INDEX = "files"
ES_DEFAULT_INDEX_ALIAS = "default"
ES_REINDEX_INDEX_ALIAS = "reindex"
ES_DEFAULT_PROJECT_INDEX = "projects"
ES_DEFAULT_PROJECT_INDEX_ALIAS = "projects-default"
ES_REINDEX_PROJECT_INDEX_ALIAS = "projects-reindex"
ES_PUBLIC_INDEX = "publications"
ES_PUBLIC_INDEX_ALIAS = "public"
ES_FILES_DOC_TYPE = "files"
ES_PROJECTS_DOC_TYPE = "projects"
ES_METADATA_DOC_TYPE = "metadata"

HAYSTACK_CONNECTIONS = {
    'default': {
        'ENGINE': ('haystack.backends.elasticsearch_backend.'
                   'ElasticsearchSearchEngine'),
        'URL': 'test:9200/',
        'INDEX_NAME': 'cms',
    }
}
HAYSTACK_ROUTERS = ['aldryn_search.router.LanguageRouter', ]

"""
SETTINGS: LOGGING
"""

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'default': {
            'format': '[DJANGO-TEST] %(levelname)s %(asctime)s %(module)s '
                      '%(name)s.%(funcName)s:%(lineno)s: %(message)s'
        },
        'agave': {
            'format': '[AGAVE-TEST] %(levelname)s %(asctime)s %(module)s '
                      '%(name)s.%(funcName)s:%(lineno)s: %(message)s'
        },
        'metrics': {
            'format': '[METRICS-TEST] %(levelname)s %(module)s %(name)s.'
                      '%(funcName)s:%(lineno)s: %(message)s '
                      'user=%(user)s sessionId=%(sessionId)s '
                      'op=%(operation)s info=%(info)s'
        },
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'default',
        },
        'metrics_console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'metrics',
        }
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': True,
        },
        'portal': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
        'metrics': {
            'handlers': ['metrics_console'],
            'level': 'INFO',
        },
        'paramiko': {
            'handlers': ['console'],
            'level': 'DEBUG'
        }
    },
}

MIGRATION_MODULES = {
    'auth': None,
    'contenttypes': None,
    'default': None,
    'sessions': None,
    'core': None,
    'profiles': None,
    'snippets': None,
    'scaffold_templates': None,
    'cms': None,
    'filer': None,
    'aldryn_bootstrap3': None,
    'cmsplugin_cascade': None,
    'cmsplugin_filer_file': None,
    'cmsplugin_filer_image': None,
    'cmsplugin_filer_video': None,
    'cmsplugin_filer_teaser': None,
    'cmsplugin_filer_link': None,
    'cmsplugin_filer_folder': None,
    'djangocms_audio': None,
    'djangocms_googlemap': None,
    'djangocms_snippet': None,
    'djangocms_style': None,
    'djangocms_text_ckeditor': None,
    'djangocms_video': None,
    'cmsplugin_socialsharekit': None,
    'cmsplugin_iframe': None,
    'djangocms_forms': None
}

COMMUNITY_INDEX_SCHEDULE = {'hour': 0, 'minute': 0, 'day_of_week': 0}

# CMS Test Coverage for Settings.

CMS_PERMISSION = True

CMS_PLACEHOLDER_CONF = {}

CMSPLUGIN_CASCADE_PLUGINS = ['cmsplugin_cascade.bootstrap3']
CMSPLUGIN_CASCADE_PLUGINS.append('cmsplugin_cascade.link')
SELECT2_CSS = 'node_modules/select2/dist/css/select2.min.css'  # PATH?
SELECT2_JS = 'node_modules/select2/dist/js/select2.min.js'     # PATH?


CMSPLUGIN_FILER_IMAGE_STYLE_CHOICES = (
    ('default', 'Default'),
)
CMSPLUGIN_FILER_IMAGE_DEFAULT_STYLE = 'default'

# These settings enable iFrames in the CMS cktext-editor.
TEXT_ADDITIONAL_TAGS = ('iframe',)
TEXT_ADDITIONAL_ATTRIBUTES = ('scrolling', 'allowfullscreen', 'frameborder', 'src', 'height', 'width')

TEXT_SAVE_IMAGE_FUNCTION='cmsplugin_filer_image.integrations.ckeditor.create_image_plugin'

THUMBNAIL_HIGH_RESOLUTION = True

THUMBNAIL_PROCESSORS = (
    'easy_thumbnails.processors.colorspace',
    'easy_thumbnails.processors.autocrop',
    'filer.thumbnail_processors.scale_and_crop_with_subject_location',
    'easy_thumbnails.processors.filters',
    'easy_thumbnails.processors.background'
)

CKEDITOR_SETTINGS = {
    'language': '{{ language }}',
    'skin': 'moono-lisa',
    'toolbar': 'CMS',
}

ALDRYN_BOILERPLATE_NAME='bootstrap3'

# DJANGOCMS_FORMS_RECAPTCHA_PUBLIC_KEY = RECAPTCHA_PUBLIC_KEY
# DJANGOCMS_FORMS_RECAPTCHA_SECRET_KEY = RECAPTCHA_PRIVATE_KEY

DJANGOCMS_AUDIO_ALLOWED_EXTENSIONS = ['mp3', 'ogg', 'wav']

DJANGOCMS_VIDEO_ALLOWED_EXTENSIONS = ['mp4', 'webm', 'ogv']
