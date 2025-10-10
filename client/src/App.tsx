import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, Autocomplete, List, ListItem, Typography, Alert, CircularProgress } from '@mui/material';
import { Project, StepCase } from './types';
import { getProjects, createProject, analyze } from './api';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [search, setSearch] = useState('');
  const [cases, setCases] = useState<StepCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  }, [selected]);

  const filtered = (cases || []).filter(c =>
    c.caseId.toLowerCase().includes(search.toLowerCase()) ||
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
            onChange={async e => {
              const file = e.target.files?.[0];
              if (!file) return;
              const name = prompt('Project name?') || 'New Project';
              const repoUrl = prompt('Repo URL?') || '';
              setLoading(true);
              try {
                const project = await createProject(name, repoUrl, file);
                setProjects(prev => [...(prev || []), project]);
                setSelected(project);
                setError(null);
              } catch (err) {
                console.error('Failed to create project:', err);
                setError('Failed to create project');
              } finally {
                setLoading(false);
              }
            }}
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

      <List>
        {filtered.map(c => (
          <ListItem key={c.caseId} alignItems="flex-start">
            <Box>
              <Typography variant="subtitle1">{c.caseId}</Typography>
              <ol>
                {c.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default App;
