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

const dev = async (): Promise<void> => {
  console.log('🚀 Starting development environment...');
  
  // Step 1: Build TypeScript files
  const tscBuildSuccess = await runCommand('npx tsc', 'Building TypeScript files');
  if (!tscBuildSuccess) {
    console.error('❌ Dev setup aborted due to TypeScript build errors.');
    process.exit(1);
  }
  
  // Step 2: Translate content
  const translationSuccess = await runCommand('node dist/translate.js', 'Translating content');
  if (!translationSuccess) {
    console.error('❌ Dev setup aborted due to translation errors.');
    process.exit(1);
  }
  
  // Step 3: Generate menu
  const menuSuccess = await runCommand('node dist/generate-menu.js', 'Generating menu');
  if (!menuSuccess) {
    console.error('❌ Dev setup aborted due to menu generation errors.');
    process.exit(1);
  }
  
  // Step 4: Run Jekyll server
  console.log('\n🔄 Starting Jekyll server...\n');
  
  try {
    // Set the JEKYLL_ENV environment variable
    process.env.JEKYLL_ENV = 'development';
    
    // Use exec instead of execAsync to keep the process running
    const jekyllProcess = exec('jekyll serve --livereload', {
      env: { ...process.env, JEKYLL_ENV: 'development' }
    });
    
    jekyllProcess.stdout?.on('data', (data) => {
      console.log(data);
    });
    
    jekyllProcess.stderr?.on('data', (data) => {
      console.error(data);
    });
    
    jekyllProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`\n❌ Jekyll server exited with code ${code}`);
      }
    });
    
    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n\n💤 Shutting down development server...');
      jekyllProcess.kill('SIGINT');
      process.exit(0);
    });
  } catch (error: any) {
    console.error(`❌ Error starting Jekyll server: ${error.message}`);
    process.exit(1);
  }
};

dev(); 