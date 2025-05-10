import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';
import { translate as googleTranslate } from '@vitalets/google-translate-api';

// Configuration
interface TranslationConfig {
  defaultLang: string;
  targetLangs: string[];
  translationsDir: string;
  sourceDirs: string[];
  fileExtensions: string[];
  excludePatterns: string[];
  preservedWords: Record<string, string[]>;
}

const config: TranslationConfig = {
  defaultLang: process.env.DEFAULT_LANG || 'fr',
  targetLangs: (process.env.TARGET_LANGS || 'en,es,de,zh,id,fil').split(','),
  translationsDir: '_i18n',
  sourceDirs: ['content', '_posts', 'pages', '.'],
  fileExtensions: ['.md', '.html', '.yml', '.yaml'],
  excludePatterns: ['node_modules', '_site', '.git', 'assets', 'scripts', 'vendor', 'dist'],
  // Words to preserve in each language
  preservedWords: {
    'fr': ['po', 'Canaan', 'G.Carotto'],
    'en': ['po', 'Canaan', 'G.Carotto'],
    'es': ['po', 'Canaan', 'G.Carotto'],
    'de': ['po', 'Canaan', 'G.Carotto'],
  }
};

// Ensure translation directory exists
async function ensureTranslationDirExists(): Promise<void> {
  try {
    await fs.mkdir(config.translationsDir, { recursive: true });
    console.log(`Created translations directory: ${config.translationsDir}`);
  } catch (error: any) {
    if (error.code !== 'EEXIST') {
      console.error(`Error creating translations directory: ${error.message}`);
      throw error;
    }
  }

  for (const lang of config.targetLangs) {
    try {
      await fs.mkdir(path.join(config.translationsDir, lang), { recursive: true });
      console.log(`Created language directory: ${lang}`);
    } catch (error: any) {
      if (error.code !== 'EEXIST') {
        console.error(`Error creating language directory for ${lang}: ${error.message}`);
        throw error;
      }
    }
  }
}

// Find all translatable files
async function findTranslatableFiles(): Promise<string[]> {
  const allFiles: string[] = [];

  for (const sourceDir of config.sourceDirs) {
    try {
      const filePattern = path.join(sourceDir, '**/*+(.md|.html)');
      const options = { ignore: config.excludePatterns.map(pattern => `**/${pattern}/**`) };
      const files = await glob(filePattern, options);
      allFiles.push(...files);
    } catch (error: any) {
      console.error(`Error finding files in ${sourceDir}: ${error.message}`);
    }
  }

  // Add index.html specifically if it exists in the root
  if (fs.existsSync('index.html')) {
    allFiles.push('index.html');
  }

  return allFiles;
}

interface TranslatableContent {
  frontmatter?: Record<string, any>;
  body: string;
}

// Extract translatable content from a file
async function extractTranslatableContent(filePath: string): Promise<TranslatableContent | null> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    
    // Handle frontmatter for markdown and HTML files
    if (filePath.endsWith('.md') || filePath.endsWith('.html')) {
      const { data, content: body } = matter(content);
      
      // Extract translatable fields from frontmatter
      const translatableFrontmatter: Record<string, any> = {};
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string' && ['title', 'description', 'subtitle', 'excerpt'].includes(key)) {
          translatableFrontmatter[key] = value;
        }
      }
      
      return {
        frontmatter: translatableFrontmatter,
        body: body.trim()
      };
    }
    
    // For other file types, just return the content
    return { body: content.trim() };
  } catch (error: any) {
    console.error(`Error extracting content from ${filePath}: ${error.message}`);
    return null;
  }
}

// Translate content to target language
async function translateContent(content: string, targetLang: string): Promise<string> {
  if (!content.trim()) return content;
  
  // Replace preserved words with placeholders
  const preservedWordMap = new Map<string, string>();
  let modifiedContent = content;
  
  if (config.preservedWords[targetLang]) {
    config.preservedWords[targetLang].forEach((word, index) => {
      const placeholder = `__PRESERVED_WORD_${index}__`;
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      modifiedContent = modifiedContent.replace(regex, placeholder);
      preservedWordMap.set(placeholder, word);
    });
  }
  
  // Add retry mechanism with exponential backoff
  const maxRetries = 5;
  let retryCount = 0;
  let translatedText = '';
  
  while (retryCount <= maxRetries) {
    try {
      // Translate the modified content
      const result = await googleTranslate(modifiedContent, { to: targetLang });
      translatedText = result.text;
      
      // If successful, exit retry loop
      break;
    } catch (error: any) {
      retryCount++;
      
      // If it's a rate limit error and we haven't exceeded max retries
      if (error.message.includes('Too Many Requests') && retryCount <= maxRetries) {
        // Calculate exponential backoff delay: 2^retryCount * 1000ms + random jitter
        const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 1000;
        console.log(`Rate limit reached. Retrying in ${Math.round(delay/1000)} seconds... (Attempt ${retryCount}/${maxRetries})`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      } else if (retryCount > maxRetries) {
        console.error(`Translation failed after ${maxRetries} retries: ${error.message}`);
        return content; // Return original content after all retries failed
      } else {
        console.error(`Translation error: ${error.message}`);
        return content; // Return original content for non-rate limit errors
      }
    }
  }
  
  // If we have a translated result, restore preserved words
  if (translatedText) {
    preservedWordMap.forEach((originalWord, placeholder) => {
      const placeholderRegex = new RegExp(placeholder, 'g');
      translatedText = translatedText.replace(placeholderRegex, originalWord);
    });
    return translatedText;
  }
  
  // Fallback to original content
  return content;
}

// Translate frontmatter fields
async function translateFrontmatter(frontmatter: Record<string, any>, targetLang: string): Promise<Record<string, any>> {
  const translatedFrontmatter: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(frontmatter)) {
    if (typeof value === 'string' && value.trim()) {
      translatedFrontmatter[key] = await translateContent(value, targetLang);
    } else {
      translatedFrontmatter[key] = value;
    }
  }
  
  return translatedFrontmatter;
}

// Save translated content to file
async function saveTranslation(filePath: string, translatedContent: TranslatableContent, lang: string): Promise<void> {
  try {
    const relativePath = path.relative('.', filePath);
    const targetDir = path.join(config.translationsDir, lang, path.dirname(relativePath));
    const targetFile = path.join(targetDir, path.basename(filePath));
    
    await fs.mkdirp(targetDir);
    
    if (translatedContent.frontmatter) {
      // Add language to frontmatter
      translatedContent.frontmatter.lang = lang;
      
      // Reconstruct the file with frontmatter
      const fileContent = matter.stringify(translatedContent.body, translatedContent.frontmatter);
      await fs.writeFile(targetFile, fileContent);
    } else {
      await fs.writeFile(targetFile, translatedContent.body);
    }
    
    console.log(`Saved translation for ${filePath} to ${targetFile}`);
  } catch (error: any) {
    console.error(`Error saving translation for ${filePath}: ${error.message}`);
  }
}

// Main translation process
async function translateFiles(): Promise<void> {
  try {
    await ensureTranslationDirExists();
    
    const files = await findTranslatableFiles();
    console.log(`Found ${files.length} files to translate.`);
    
    for (const file of files) {
      console.log(`Processing ${file}...`);
      
      const content = await extractTranslatableContent(file);
      if (!content) continue;
      
      for (const lang of config.targetLangs) {
        if (lang === config.defaultLang) continue; // Skip default language
        
        console.log(`  Translating to ${lang}...`);
        
        const translatedContent = {
          frontmatter: content.frontmatter 
            ? await translateFrontmatter(content.frontmatter, lang)
            : undefined,
          body: await translateContent(content.body, lang)
        };
        
        await saveTranslation(file, translatedContent, lang);
        
        // Add a delay between translations to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      // Add a longer delay between files
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    console.log('Translation completed successfully.');
  } catch (error: any) {
    console.error(`Translation process failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the translation process
translateFiles(); 