const slugify = require('../utils/slugify');
const Project = require('../models/Project');
const octokit = require('../config/github');
const { validationResult } = require('express-validator');

// Dashboard for DevProof: list current projects
exports.dashboard = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.session.userId });
    res.render('dashboard/devproof/index', { title: 'DevProof', projects });
  } catch (err) {
    console.error(err);
    res.status(500).render('dashboard/devproof/index', { title: 'DevProof', projects: [], error: 'Failed to load projects' });
  }
};

// Show import page: fetch repos from GitHub
exports.getImport = async (req, res) => {
  const username = req.query.username;
  if (!username) {
    return res.render('dashboard/devproof/import', { title: 'Import Repositories', repos: [], error: null });
  }
  try {
    const response = await octokit.rest.repos.listForUser({ username, per_page: 100 });
    const repos = response.data
      .filter((repo) => !repo.fork)
      .map((repo) => ({ name: repo.name, full_name: repo.full_name, description: repo.description }));
    res.render('dashboard/devproof/import', { title: 'Import Repositories', repos, error: null, username });
  } catch (err) {
    console.error(err);
    res.render('dashboard/devproof/import', { title: 'Import Repositories', repos: [], error: 'Could not fetch repositories. Please ensure the username is correct.', username });
  }
};

// Import selected repositories
exports.postImport = async (req, res) => {
  const selected = req.body.repos;
  const username = req.body.username;
  if (!selected) {
    return res.redirect(`/dashboard/devproof/import?username=${username}`);
  }
  const repoList = Array.isArray(selected) ? selected : [selected];
  try {
    for (const fullName of repoList) {
      const [owner, repo] = fullName.split('/');
      // Fetch repo details
      const { data } = await octokit.rest.repos.get({ owner, repo });
      // Create slug unique per project
      const baseSlug = slugify(data.name);
      let slug = baseSlug;
      let count = 1;
      // Ensure uniqueness
      while (await Project.findOne({ slug })) {
        slug = `${baseSlug}-${count}`;
        count += 1;
      }
      const project = new Project({
        owner: req.session.userId,
        slug,
        name: data.name,
        description: data.description || '',
        repoUrl: data.html_url,
        liveDemoUrl: '',
        screenshots: [],
        featured: false,
        private: false,
      });
      await project.save();
    }
    res.redirect('/dashboard/devproof');
  } catch (err) {
    console.error(err);
    res.status(500).render('dashboard/devproof/index', { title: 'DevProof', projects: [], error: 'Failed to import repositories.' });
  }
};

// View a project page
exports.showProject = async (req, res, next) => {
  const slug = req.params.slug;
  try {
    const project = await Project.findOne({ slug, private: false }).populate('owner');
    if (!project) return next();
    res.render('projects/show', { title: project.name, project });
  } catch (err) {
    next(err);
  }
};