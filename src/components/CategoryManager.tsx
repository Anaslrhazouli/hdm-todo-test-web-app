import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, IconButton, Container,
} from '@mui/material';
import { Edit, Delete, Check } from '@mui/icons-material';
import useFetch from '../hooks/useFetch';

const CategoryManager = () => {
  const api = useFetch();
  const [ categories, setCategories ] = useState([]);
  const [ editingCategoryId, setEditingCategoryId ] = useState<number | null>(null);
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

  const handleSaveCategory = async (id: number, name: string) => {
    try {
      const payload = { name };
      await api.patch(`/categories/${id}`, payload);
      setEditingCategoryId(null); // Reset editing mode
      await handleFetchCategories(); // Fetch categories again to reflect the changes
    } catch (error) {
      console.error('Failed to save category:', error);
      setError('Failed to save category. Please try again.');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await api.delete(`/categories/${id}`);
      await handleFetchCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      setError('Failed to delete category. Please try again.');
    }
  };

  useEffect(() => {
    handleFetchCategories();
  }, []);

  return (
    <Container maxWidth="sm">
      <Box display="flex" justifyContent="center" mt={5}>
        <Typography variant="h2" gutterBottom>Manage Categories</Typography>
      </Box>

      {error && (
        <Box mt={2} color="error.main">
          <Typography>{error}</Typography>
        </Box>
      )}

      <Box mt={5} flexDirection="column">
        {categories.map((category) => (
          <Box
            key={category.id}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt={2}
            gap={1}
            width="100%"
            sx={{ backgroundColor: editingCategoryId === category.id ? '#f0f0f0' : 'white', padding: 1, borderRadius: 1 }}
          >
            <TextField
              size="small"
              value={category.name}
              onChange={(e) => {
                const updatedCategories = categories.map((c) => (c.id === category.id ? { ...c, name: e.target.value } : c));
                setCategories(updatedCategories);
              }}
              fullWidth
              InputProps={{
                style: { color: 'black' },
                readOnly: editingCategoryId !== category.id,
              }}
              sx={{ flexGrow: 1, marginRight: 1 }}
            />
            <Box display="flex" gap={1}>
              {editingCategoryId === category.id ? (
                <IconButton color="primary" onClick={() => handleSaveCategory(category.id, category.name)} disabled={!category.name.trim()}>
                  <Check />
                </IconButton>
              ) : (
                <IconButton color="primary" onClick={() => setEditingCategoryId(category.id)}>
                  <Edit />
                </IconButton>
              )}
              <IconButton color="error" onClick={() => handleDeleteCategory(category.id)}>
                <Delete />
              </IconButton>
            </Box>
          </Box>
        ))}
        <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
          <TextField
            size="small"
            value={editingCategoryId === null ? '' : ''}
            onChange={(e) => {}}
            fullWidth
            sx={{ maxWidth: 350 }}
            placeholder="New category name"
            InputProps={{
              style: { color: 'black' },
            }}
          />
          <Button variant="contained" color="primary" onClick={() => {}} disabled sx={{ marginLeft: 1 }}>
            Add Category
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default CategoryManager;
