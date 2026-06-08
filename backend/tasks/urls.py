from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, TaskViewSet

router = DefaultRouter()
router.register(r"tasks", TaskViewSet, basename="task")
router.register(r"categories", CategoryViewSet, basename="category")

# /api/tasks/・/api/categories/ とそれぞれの <id>/ が自動生成される
urlpatterns = router.urls
