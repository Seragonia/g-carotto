import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const runCommand = async (command: string, description: string): Promise<boolean> => {
  console.log(`\n🔄 ${description}...\n`);
  
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    return true;
  } catch (error: any) {
    console.error(`❌ Error in ${description}:`, error.message);
    return false;
  }
};

const build = async (): Promise<void> => {
  console.log('🚀 Starting build process (without translation)...');
  
  // Step 1: Build TypeScript files
  const tscBuildSuccess = await runCommand('npx tsc', 'Building TypeScript files');
  if (!tscBuildSuccess) {
    console.error('❌ Build aborted due to TypeScript build errors.');
    process.exit(1);
  }
  
  // Step 2: translation
  /* Translation temporarily disabled
  const translationSuccess = await runCommand('node dist/translate.js', 'Translating content');
  if (!translationSuccess) {
    console.error('❌ Build aborted due to translation errors.');
    process.exit(1);
  }
  */
  
  console.log('🎉 Build process completed successfully!');
  console.log('\nTo build the Jekyll site, run: jekyll build');
  console.log('To serve the site locally, run: jekyll serve');
};

build(); 