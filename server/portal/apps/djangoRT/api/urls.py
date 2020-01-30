from django.urls import path
from portal.apps.djangoRT.api import views

app_name = 'portal_tickets_api'
urlpatterns = [
    path('', views.TicketsView.as_view()),
    path('<int:ticket_id>/history', views.TicketsHistoryView.as_view()),
]
