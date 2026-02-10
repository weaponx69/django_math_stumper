from django.urls import path
from . import views
from .save_prompt_view import SavePromptView

urlpatterns = [
    path('api/generate/', views.GenerateODETaskView.as_view(), name='generate_ode_task'),
    path('api/create_custom/', views.CreateCustomTaskView.as_view(), name='create_custom_task'),
    path('api/verify/', views.VerifySolutionView.as_view(), name='verify_solution'),
    path('api/task/<int:task_id>/', views.TaskDetailView.as_view(), name='task_detail'),
    path('api/task/<int:task_id>/solution/', views.TaskSolutionView.as_view(), name='task_solution'),
    path('api/save_prompt/', SavePromptView.as_view(), name='save_prompt'),
    path('', views.index, name='index'),
]
