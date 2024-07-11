import { Check, Delete, Edit } from '@mui/icons-material';
import {
  Box, Button, Container, IconButton, TextField, Typography, Checkbox, Select, MenuItem,
} from '@mui/material';
import { useEffect, useState } from 'react';
import useFetch from '../hooks/useFetch';
import { Task } from '../index';
import CategoryManager from './CategoryManager';

const TodoPage = () => {
  const api = useFetch();
  const [ tasks, setTasks ] = useState<Task[]>([]);
  const [ categories, setCategories ] = useState([]);
  const [ selectedCategoryId, setSelectedCategoryId ] = useState<number | null>(null);
  const [ newTaskName, setNewTaskName ] = useState('');
  const [ newTaskCategoryId, setNewTaskCategoryId ] = useState<number | null>(null);
  const [ editingTaskId, setEditingTaskId ] = useState<number | null>(null);
  const [ error, setError ] = useState<string | null>(null);

  const handleFetchCategories = async () => {
    try {
      const data = await api.get('/categories');
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        console.error('Unexpected response format:', data);
        setError('Failed to fetch categories. Unexpected data format.');
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setError('Failed to fetch categories. Please try again.');
    }
  };

  const handleFetchTasks = async (categoryId = selectedCategoryId) => {
    try {
      const url = categoryId ? `/tasks/category/${categoryId}` : '/tasks';
      const data = await api.get(url);
      if (Array.isArray(data)) {
        setTasks(data);
      } else {
        console.error('Unexpected response format:', data);
        setError('Failed to fetch tasks. Unexpected data format.');
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setError('Failed to fetch tasks. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    console.log(`Deleting task with id: ${id}`);
    try {
      await api.delete(`/tasks/${id}`);
      await handleFetchTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
      setError('Failed to delete task. Please try again.');
    }
  };
  const handleSave = async () => {
    try {
      if (!newTaskCategoryId) {
        setError('Please select a category');
        return;
      }

      const payload = { name: newTaskName, categoryId: newTaskCategoryId };
      console.log('Sending task data:', payload);

      await api.post('/tasks', payload);

      setNewTaskName('');
      setNewTaskCategoryId(null);
      await handleFetchTasks();
    } catch (error) {
      setError('Failed to save task. Please try again.');
    }
  };
  const handleEdit = (taskId: number) => {
    setEditingTaskId(taskId);
  };

  const handleUpdate = async (taskId: number, newName: string) => {
    try {
      await api.patch(`/tasks/${taskId}`, { name: newName });
      setEditingTaskId(null);
      await handleFetchTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
      setError('Failed to update task. Please try again.');
    }
  };

  const handleToggleComplete = async (taskId: number) => {
    try {
      await api.patch(`/tasks/${taskId}/toggle`);
      await handleFetchTasks();
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
      setError('Failed to toggle task completion. Please try again.');
    }
  };

  useEffect(() => {
    handleFetchCategories();
    handleFetchTasks();
  }, [ selectedCategoryId ]);

  return (
    <Container maxWidth="sm">
      <Box display="flex" justifyContent="center" mt={5}>
        <Typography variant="h2" gutterBottom>HDM Todo List</Typography>
      </Box>

      {error && (
        <Box mt={2} color="error.main">
          <Typography>{error}</Typography>
        </Box>
      )}

      <Box display="flex" justifyContent="space-between" mt={2}>
        <Button onClick={() => setSelectedCategoryId(null)}>All Tasks</Button>
        <Button onClick={() => setSelectedCategoryId('manage')}>Manage Categories</Button>
        {categories.map((category) => (
          <Button key={category.id} onClick={() => setSelectedCategoryId(category.id)}>
            {category.name}
          </Button>
        ))}
      </Box>

      {selectedCategoryId === 'manage' ? (
        <CategoryManager />
      ) : (
        <Box mt={5} flexDirection="column">
          {tasks.map((task) => (
            <Box
              key={task.id}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={2}
              gap={1}
              width="100%"
              sx={{ backgroundColor: editingTaskId === task.id ? '#f0f0f0' : 'white', padding: 1, borderRadius: 1 }}
            >
              <Checkbox
                checked={task.completed}
                onChange={() => handleToggleComplete(task.id)}
                inputProps={{ 'aria-label': 'toggle task complete' }}
              />
              <TextField
                size="small"
                value={task.name}
                onChange={(e) => {
                  if (editingTaskId === task.id) {
                    const updatedTasks = tasks.map((t) => (t.id === task.id ? { ...t, name: e.target.value } : t));
                    setTasks(updatedTasks);
                  }
                }}
                fullWidth
                InputProps={{
                  style: { color: 'black', textDecoration: task.completed ? 'line-through' : 'none' },
                  readOnly: editingTaskId !== task.id || task.completed,
                }}
                sx={{ flexGrow: 1, marginRight: 1 }}
              />
              <Box display="flex" gap={1}>
                {editingTaskId === task.id ? (
                  <IconButton color="primary" onClick={() => handleUpdate(task.id, task.name)} disabled={task.completed}>
                    <Check />
                  </IconButton>
                ) : (
                  <IconButton color="primary" onClick={() => handleEdit(task.id)} disabled={task.completed}>
                    <Edit />
                  </IconButton>
                )}
                <IconButton color="error" onClick={() => handleDelete(task.id)}>
                  <Delete />
                </IconButton>
              </Box>
            </Box>
          ))}
          <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
            <TextField
              size="small"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              fullWidth
              sx={{ maxWidth: 350 }}
              placeholder="New task name"
              InputProps={{
                style: { color: 'black' },
              }}
            />
            <Select
              value={newTaskCategoryId || ''}
              onChange={(e) => setNewTaskCategoryId(Number(e.target.value))}
              displayEmpty
              inputProps={{ 'aria-label': 'Select Category' }}
              sx={{ marginLeft: 1, minWidth: 120 }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>

            <Button variant="contained" color="primary" onClick={handleSave} disabled={!newTaskName.trim() || !newTaskCategoryId} sx={{ marginLeft: 1 }}>
              Add Task
            </Button>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default TodoPage;
