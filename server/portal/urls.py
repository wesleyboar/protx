"""
.. :module:: portal.urls
    :synopsis: Main URLs
"""

from cms.sitemaps import CMSSitemap
from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.i18n import i18n_patterns
from django.contrib import admin
from django.contrib.sitemaps.views import sitemap
from django.conf.urls.static import static
from django.views.generic import RedirectView

from django.contrib.auth.views import logout as des_logout
from portal.apps.auth.views import agave_oauth as login
from portal.views.views import project_version as des_version

admin.autodiscover()

urlpatterns = [
    url(r'^sitemap\.xml$', sitemap,
        {'sitemaps': {'cmspages': CMSSitemap}}),
]

urlpatterns += [

    # admin.
    url(r'^admin/', admin.site.urls),

    # terms-and-conditions
    url(r'^terms/', include('termsandconditions.urls')),

    # auth.
    url(r'^accounts/', include('portal.apps.accounts.urls',
                               namespace='portal_accounts')),
    url(r'^api/accounts/',
        include(
            'portal.apps.accounts.api.urls',
            namespace='portal_accounts_api'
        )),
    url(r'^register/$',
        RedirectView.as_view(
            pattern_name='portal_accounts:register',
            permanent=True),
        name='register'),
    url(r'^auth/', include('portal.apps.auth.urls',
                           namespace='portal_auth')),
    url(r'^logout/$', des_logout,
        {'next_page': '/auth/logged-out/'}, name='logout'),
    url(r'^login/$', login),

    # apps.
    # url(r'^data-depot/', include('portal.apps.data_depot.urls',
    #                              namespace='data_depot')),
    url(r'^api/data-depot/', include('portal.apps.data_depot.api.urls',
                                     namespace='data_depot_api')),
    # url(r'^workspace/', include('portal.apps.workspace.urls',
    #                             namespace='workspace')),
    url(r'^api/workspace/', include('portal.apps.workspace.api.urls',
                                    namespace='workspace_api')),
    url(r'^api/projects/', include('portal.apps.projects.urls',
                                    namespace='projects_api')),
    url(r'^search/', include('portal.apps.search.urls',
                             namespace='search')),
    url(r'^api/search/', include('portal.apps.search.api.urls',
                                 namespace='search')),
    url(r'^workbench/', include('portal.apps.workbench.urls',
                                namespace='workbench')),
    url(r'^tickets/', include('portal.apps.djangoRT.urls',
                              namespace='tickets')),

    # notifications
    url(r'^notifications/', include('portal.apps.notifications.urls',
                                    namespace='notifications')),

    # webhooks
    url(r'^webhooks/', include('portal.webhooks', namespace='webhooks')),

    # version check.
    url(r'^version/', des_version),

    # cms forms.
    url(r'^', include('djangocms_forms.urls')),

    # cms handles everything else.
    url(r'^', include('cms.urls')),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
