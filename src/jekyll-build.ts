import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const runJekyll = async (): Promise<void> => {
  console.log('🚀 Building site with Jekyll...');
  
  try {
    const { stdout, stderr } = await execAsync('jekyll build');
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    console.log('🎉 Jekyll build completed successfully!');
  } catch (error: any) {
    console.error('❌ Error building with Jekyll:', error.message);
    process.exit(1);
  }
};

runJekyll(); 