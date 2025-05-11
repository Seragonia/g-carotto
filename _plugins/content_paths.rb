require 'fileutils'

# Copy content files to their clean URL paths
Jekyll::Hooks.register :site, :post_write do |site|
  # Map from content directories to clean URLs
  mappings = {
    'content/game' => 'game',
    'content/classes' => 'classes',
    'content/pets' => 'pets',
    'content/quests' => 'quests', 
    'content/rebirth' => 'rebirth',
    'content/misc' => 'misc',
    'content/faq' => 'faq',
    'content/home' => 'home'
  }
  
  # If home page is also root page (based on home.root setting)
  if site.data['pages'] && site.data['pages']['home'] && site.data['pages']['home']['root']
    mappings['content/home'] = ''
  end
  
  site_dir = site.config['destination']
  languages = site.config['languages'] || ['en']
  default_lang = site.config['default_lang'] || languages.first
  
  mappings.each do |src, dest|
    languages.each do |lang|
      # Set proper language prefix
      prefix = lang == default_lang ? '' : "/#{lang}"
      lang_dir = File.join(site_dir, prefix)
      next unless Dir.exist?(lang_dir)
      
      src_path = File.join(lang_dir, src)
      next unless Dir.exist?(src_path)
      
      dest_path = File.join(lang_dir, dest)
      FileUtils.mkdir_p(dest_path) unless Dir.exist?(dest_path)
      
      # Copy all files from source to destination
      Dir.glob(File.join(src_path, '**/*')).each do |file|
        next if File.directory?(file)
        
        rel_path = file.sub(src_path + '/', '')
        dest_file = File.join(dest_path, rel_path)
        
        # Create parent directory if needed
        FileUtils.mkdir_p(File.dirname(dest_file)) unless Dir.exist?(File.dirname(dest_file))
        
        # Copy the file
        FileUtils.cp(file, dest_file)
      end
    end
  end
end

# Fix submenu links - ensure proper path structure
Jekyll::Hooks.register :site, :pre_render do |site|
  # Process pages to fix URL paths
  site.pages.each do |page|
    if page.url.include?('/content/')
      # Extract category and slug from the URL
      parts = page.url.split('/').reject(&:empty?)
      
      if parts.size >= 3 && parts[0] == 'content'
        category = parts[1]
        slug = parts[2..-1].join('/')
        
        # Fix URL to use proper category/slug format
        page.data['url'] = "/#{category}/#{slug}/".gsub(/\/+/, '/')
        page.data['permalink'] = "/#{category}/#{slug}/".gsub(/\/+/, '/')
      end
    end
  end
  
  # Also process menu links that might be malformatted
  processed_files = []
  
  site.each_site_file do |item|
    next unless item.is_a?(Jekyll::Page) || item.is_a?(Jekyll::Document)
    next if processed_files.include?(item.path)
    
    # Skip non-HTML files
    next unless item.output_ext == '.html'
  end
end
