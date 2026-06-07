from rest_framework.routers import DefaultRouter

from .views import TaskViewSet

router = DefaultRouter()
router.register(r"tasks", TaskViewSet, basename="task")

# /api/tasks/ と /api/tasks/<id>/ が自動生成される
urlpatterns = router.urls
