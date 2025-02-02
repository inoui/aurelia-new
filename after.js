// Use "after" task to ask user to install deps.

const {execSync} = require('child_process');

function isAvailable(bin) {
  try {
    execSync(bin + ' -v', {stdio: 'ignore'});
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = async function({
  unattended, here, prompts, run, properties, features, notDefaultFeatures, ansiColors
}, {
  // for testing
  _isAvailable = isAvailable,
  _log = console.log
} = {}) {
  const c = ansiColors;
  let depsInstalled = false;

  if (!unattended) {
    const choices = [
      {title: 'No'},
      {value: 'npm', title: 'Yes, use npm'}
    ];

    if (_isAvailable('yarn')) {
      choices.push({value: 'yarn', title: 'Yes, use yarn'});
    }

    if (_isAvailable('pnpm')) {
      choices.push({value: 'pnpm', title: 'Yes, use pnpm'});
    }

    const result = await prompts.select({
      message: 'Do you want to install npm dependencies now?',
      choices
    });

    if (result) {
      await run(result, ['install']);
      if (features.includes('playwright')) {
        await run('npx', ['playwright', 'install', '--with-deps']);
      }
      depsInstalled = true;
    }

    _log(`\nNext time, you can try to create similar project in silent mode:`);
    _log(c.inverse(` npx makes aurelia new-project-name${here ? ' --here' : ''} -s ${notDefaultFeatures.length ? (notDefaultFeatures.join(',') + ' ') : ''}`));
  }

  _log(`\n${c.underline.bold('Get Started')}`);
  if (!here) _log('cd ' + properties.name);
  if (!depsInstalled) {
    _log('npm install');
    if (features.includes('playwright')) _log('npx playwright install --with-deps');
  }
  _log('npm start\n');
};
