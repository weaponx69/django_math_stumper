# How to Save Math Prompts in Django Math Stumper

This guide explains all the ways you can save and manage the math prompts you create in the Django Math Stumper application.

## 🎯 Automatic Database Storage (Already Working!)

Every math prompt you generate or create is **automatically saved** to the database:

- **Generated Tasks**: When you click "🔄 Generate New", the task is saved to the `ODETask` model
- **Custom Tasks**: When you create a custom task, it's also saved to the `ODETask` model
- **Solutions**: When solutions are computed, they're saved to the `Solution` model

### Database Models
```python
# ODETask Model - Stores the main challenge
ODETask.objects.create(
    coefficients=task_data['coefficients'],
    x0=task_data['initial_conditions']['x0'],
    y0=task_data['initial_conditions']['y0'],
    z0=task_data['initial_conditions']['z0'],
    w0=task_data['initial_conditions']['w0'],
    target_time=task_data['target_time'],
    # ... other fields
)

# Solution Model - Stores AI-generated solutions
Solution.objects.create(
    ode_task=ode_task,
    latex_solution=latex_solution,
    raw_output=raw_output,
    # ... other fields
)
```

## 💾 Manual Save Prompt Feature (New!)

### Frontend Save Button
Click the **"💾 Save Prompt"** button to save the current prompt to your browser's localStorage:

```javascript
async function saveCurrentPrompt() {
    const promptData = {
        task_id: currentTask.task_id,
        coefficients: currentTask.coefficients,
        initial_conditions: currentTask.initial_conditions,
        target_time: currentTask.target_time,
        equations: currentTask.equation_preview,
        timestamp: new Date().toISOString(),
        type: 'saved_prompt'
    };
    
    // Save to localStorage for offline access
    const savedPrompts = JSON.parse(localStorage.getItem('saved_math_prompts') || '[]');
    savedPrompts.push(promptData);
    localStorage.setItem('saved_math_prompts', JSON.stringify(savedPrompts));
}
```

### Features of Manual Saving
1. **Offline Access**: Prompts are saved in your browser and available even without internet
2. **Prompt Management**: View, load, export, and delete saved prompts
3. **Export Functionality**: Download prompts as text files
4. **Timestamp Tracking**: See when each prompt was saved

## 📊 Accessing Saved Prompts

### Method 1: Database Query (Backend)
```python
# Get all saved tasks
all_tasks = ODETask.objects.all()

# Get tasks created today
from django.utils import timezone
today_tasks = ODETask.objects.filter(created_at__date=timezone.now().date())

# Get specific task by ID
task = ODETask.objects.get(id=123)

# Get task with solution
task_with_solution = ODETask.objects.select_related('solutions').get(id=123)
```

### Method 2: Frontend Saved Prompts Modal
Click the "💾 Save Prompt" button, then click it again to view your saved prompts:

- **📂 Load**: Reload a saved prompt into the current challenge
- **📤 Export**: Download as a text file
- **🗑️ Delete**: Remove from your saved prompts

### Method 3: Export Individual Prompts
Each saved prompt can be exported as a text file containing:
```
Math Prompt Export

Task ID: 123
Generated: 2024-02-10 14:30:00
Target Time: 1.0

Equations:
dx/dt = 0.5x + 0.3y + 0.2z + 0.1w
dy/dt = 0.2x + 0.6y + 0.1z + 0.4w
dz/dt = 0.1x + 0.2y + 0.7z + 0.3w
dw/dt = 0.4x + 0.1y + 0.2z + 0.8w

Initial Conditions:
x(0) = 0.5
y(0) = 0.5
z(0) = 0.5
w(0) = 0.5

Coefficients:
{
  "linear": [[0.5, 0.3, 0.2, 0.1], ...],
  "nonlinear": [[0, 0, 0, 0], ...]
}
```

## 🔧 Advanced Saving Options

### Create a SavedPrompt Model (Optional)
For more sophisticated prompt management, you could create a dedicated model:

```python
# In models.py
class SavedPrompt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    task = models.ForeignKey(ODETask, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_favorite = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
```

### Bulk Export Script
Create a management command to export all prompts:

```python
# management/commands/export_prompts.py
from django.core.management.base import BaseCommand
from django.core.serializers import serialize
from ode_solver.models import ODETask

class Command(BaseCommand):
    def handle(self, *args, **options):
        tasks = ODETask.objects.all()
        data = serialize('json', tasks)
        
        with open('all_prompts.json', 'w') as f:
            f.write(data)
        
        self.stdout.write(f'Exported {tasks.count()} prompts to all_prompts.json')
```

Run with: `python manage.py export_prompts`

## 🎯 Best Practices for Saving Prompts

### 1. Regular Backups
```bash
# Export database
python manage.py dumpdata ode_solver > backup_$(date +%Y%m%d).json

# Or use database-specific tools
pg_dump mydatabase > backup.sql  # PostgreSQL
mysqldump mydatabase > backup.sql  # MySQL
```

### 2. Organize by Difficulty
```python
# Tag prompts by difficulty
class DifficultyTag(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
        ('expert', 'Expert'),
    ]
    
    task = models.ForeignKey(ODETask, on_delete=models.CASCADE)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    notes = models.TextField(blank=True)
```

### 3. Version Control
```python
# Track prompt versions
class PromptVersion(models.Model):
    task = models.ForeignKey(ODETask, on_delete=models.CASCADE)
    version_number = models.IntegerField()
    changes = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
```

## 🚀 Usage Examples

### Example 1: Save and Retrieve a Challenge
```javascript
// Save current challenge
saveCurrentPrompt();

// Later, load it back
loadSavedPrompt(0); // Loads the first saved prompt
```

### Example 2: Export for Sharing
```javascript
// Export prompt as text file
exportPrompt(0); // Downloads prompt_0.txt
```

### Example 3: Database Query for Analysis
```python
# Find all prompts with specific characteristics
from ode_solver.models import ODETask

# Find prompts with high curvature
high_curvature_tasks = ODETask.objects.filter(curvature__gt=1.0)

# Find prompts solved within specific time range
recent_solutions = ODETask.objects.filter(
    created_at__gte=timezone.now() - timezone.timedelta(days=7)
)
```

## 📈 Analytics and Insights

The system automatically tracks:
- **Creation timestamps**: When each prompt was generated
- **Solution accuracy**: Whether solutions were correct
- **Prompt complexity**: Based on coefficients and metrics
- **Usage patterns**: Which prompts are accessed most

This data can be used to:
- Identify the most challenging prompts
- Track improvement over time
- Analyze solution patterns
- Generate statistics and reports

## 🔐 Security and Privacy

- **Database Security**: All prompts are stored securely in your Django database
- **Local Storage**: Browser-based saves are isolated per user/browser
- **Access Control**: You can add authentication to restrict access
- **Data Export**: You maintain full control over your prompt data

## 🎉 Summary

You now have **multiple ways to save your math prompts**:

1. ✅ **Automatic Database Storage** - Every prompt is saved automatically
2. ✅ **Manual Frontend Saving** - Save to browser localStorage with full management
3. ✅ **Export Functionality** - Download prompts as text files
4. ✅ **Database Queries** - Access prompts programmatically
5. ✅ **Bulk Operations** - Export all prompts for backup or analysis

The system provides both convenience (automatic saving) and control (manual management), ensuring you never lose your carefully crafted math challenges!