import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, Autocomplete, List, ListItem, Typography, Alert, CircularProgress, Paper, Divider, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Project, StepCase } from './types';
import { getProjects, createProject, analyze } from './api';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [search, setSearch] = useState('');
  const [cases, setCases] = useState<StepCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<StepCase | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    setLoading(true);
    getProjects()
      .then(p => {
        setProjects(Array.isArray(p) ? p : []);
        setError(null);
      })
      .catch(err => {
        console.error('Failed to load projects:', err);
        setError('Failed to load projects');
        setProjects([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setCases(selected?.cases || []);
    setSelectedCase(null);
  }, [selected]);

  const filtered = (cases || []).filter(c =>
    c.caseId.toLowerCase().includes(search.toLowerCase()) ||
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.steps.join(' ').toLowerCase().includes(search.toLowerCase())
  );

  const handleAnalyze = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const result = await analyze(selected._id);
      setCases(Array.isArray(result) ? result : []);
      setError(null);
    } catch (err) {
      console.error('Failed to analyze project:', err);
      setError('Failed to analyze project');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setDialogOpen(true);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setProjectName('');
    setRepoUrl('');
    setSelectedFile(null);
  };

  const handleCreateProject = async () => {
    if (!selectedFile) return;
    const name = projectName || 'New Project';
    setLoading(true);
    setDialogOpen(false);
    try {
      const project = await createProject(name, repoUrl, selectedFile);
      setProjects(prev => [...(prev || []), project]);
      setSelected(project);
      setError(null);
      setProjectName('');
      setRepoUrl('');
      setSelectedFile(null);
    } catch (err) {
      console.error('Failed to create project:', err);
      setError('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={2}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {loading && (
        <Box display="flex" justifyContent="center" mb={2}>
          <CircularProgress />
        </Box>
      )}
      <Box display="flex" gap={2} mb={2}>
        <Autocomplete
          options={projects || []}
          getOptionLabel={(p) => p?.name || ''}
          sx={{ width: 300 }}
          value={selected}
          onChange={(_e, value) => setSelected(value)}
          renderInput={params => <TextField {...params} label="Project" />}
        />
        <Button variant="contained" component="label">
          New Project
          <input
            hidden
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
          />
        </Button>
        <TextField
          label="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Button variant="outlined" onClick={handleAnalyze} disabled={!selected || loading}>
          Analyze
        </Button>
      </Box>

      <Box display="flex" gap={2} sx={{ height: 'calc(100vh - 200px)' }}>
        {/* Master List - Left Side */}
        <Paper sx={{ width: '40%', overflow: 'auto' }}>
          <List>
            {filtered.map(c => (
              <ListItem
                key={c.caseId}
                button
                selected={selectedCase?.caseId === c.caseId}
                onClick={() => setSelectedCase(c)}
                sx={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    },
                  },
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  {c.caseId}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {c.title}
                </Typography>
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Detail View - Right Side */}
        <Paper sx={{ width: '60%', p: 2, overflow: 'auto' }}>
          {selectedCase ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedCase.caseId}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {selectedCase.title}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Steps:
              </Typography>
              <ol>
                {selectedCase.steps.map((s, i) => (
                  <li key={i}>
                    <Typography variant="body1">{s}</Typography>
                  </li>
                ))}
              </ol>
            </Box>
          ) : (
            <Box display="flex" alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
              <Typography variant="body1" color="text.secondary">
                Select a test case to view details
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 400, pt: 1 }}>
            <TextField
              label="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="New Project"
              fullWidth
              autoFocus
            />
            <TextField
              label="Repository URL"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/..."
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleCreateProject} variant="contained" disabled={!selectedFile}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default App;
