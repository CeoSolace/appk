const Project = require('../models/Project');
const octokit = require('../config/github');
const slugify = require('../utils/slugify');

exports.dashboard = async (req, res) => {
  try {
    const projects = await Project.find({
      owner: req.session.userId,
    }).sort({ createdAt: -1 });

    return res.render('dashboard/devproof/index', {
      title: 'DevProof',
      projects: projects || [],
      error: null,
    });
  } catch (err) {
    console.error('[DevProof Dashboard]', err);

    return res.status(500).render('dashboard/devproof/index', {
      title: 'DevProof',
      projects: [],
      error: 'Failed to load projects.',
    });
  }
};

exports.getImport = async (req, res) => {
  const username = String(req.query.username || '').trim();

  if (!username) {
    return res.render('dashboard/devproof/import', {
      title: 'Import GitHub Repos',
      repos: [],
      username: '',
      error: null,
    });
  }

  try {
    const response = await octokit.rest.repos.listForUser({
      username,
      per_page: 30,
      sort: 'updated',
    });

    const repos = response.data
      .filter((repo) => !repo.fork)
      .map((repo) => ({
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description || '',
      }));

    return res.render('dashboard/devproof/import', {
      title: 'Import GitHub Repos',
      repos,
      username,
      error: null,
    });
  } catch (err) {
    console.error('[GitHub Import Fetch]', err.message);

    return res.render('dashboard/devproof/import', {
      title: 'Import GitHub Repos',
      repos: [],
      username,
      error: 'Could not fetch GitHub repositories. Check the username or GitHub token.',
    });
  }
};

exports.postImport = async (req, res) => {
  try {
    const selected = req.body.repos;
    const repoList = Array.isArray(selected)
      ? selected
      : selected
        ? [selected]
        : [];

    if (repoList.length === 0) {
      return res.redirect('/dashboard/devproof/import');
    }

    const currentCount = await Project.countDocuments({
      owner: req.session.userId,
    });

    if (currentCount >= 10) {
      return res.redirect('/dashboard/devproof');
    }

    const allowedSlots = Math.max(0, 10 - currentCount);
    const limitedRepos = repoList.slice(0, allowedSlots);

    for (const fullName of limitedRepos) {
      const [owner, repo] = fullName.split('/');

      if (!owner || !repo) continue;

      const existing = await Project.findOne({
        owner: req.session.userId,
        repoUrl: `https://github.com/${owner}/${repo}`,
      });

      if (existing) continue;

      const { data } = await octokit.rest.repos.get({ owner, repo });

      const baseSlug = slugify(`${data.name}-${Date.now()}`);
      let slug = baseSlug;
      let attempt = 1;

      while (await Project.findOne({ slug })) {
        slug = `${baseSlug}-${attempt}`;
        attempt += 1;
      }

      await Project.create({
        owner: req.session.userId,
        slug,
        name: data.name.slice(0, 80),
        description: (data.description || '').slice(0, 1000),
        repoUrl: data.html_url,
        liveDemoUrl: data.homepage || '',
        screenshots: [],
        featured: false,
        private: false,
      });
    }

    return res.redirect('/dashboard/devproof');
  } catch (err) {
    console.error('[GitHub Import Save]', err);

    return res.status(500).render('dashboard/devproof/import', {
      title: 'Import GitHub Repos',
      repos: [],
      username: '',
      error: 'Failed to import repositories.',
    });
  }
};

exports.showProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      slug: req.params.slug,
      private: false,
    }).populate('owner');

    if (!project) return next();

    return res.render('projects/show', {
      title: project.name,
      project,
    });
  } catch (err) {
    return next(err);
  }
};
