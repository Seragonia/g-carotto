require 'yaml'

Jekyll::Hooks.register :site, :pre_render do |site|
  content_data = {}
  
  # Load translations from the centralized pages.yml file
  pages_file = File.join(site.source, 'data', 'pages.yml')
  
  if File.exist?(pages_file)
    begin
      pages_data = YAML.load_file(pages_file)
      
      # Process each section in pages.yml
      pages_data.each do |section_key, section_data|
        content_data[section_key] = {'translations' => section_data}
        puts "Loaded translations for #{section_key}"
      end
      
      # Add the content data to the site data
      site.data['content'] = content_data
    rescue => e
      puts "Error loading translations from pages.yml: #{e.message}"
    end
  else
    puts "Warning: pages.yml file not found at #{pages_file}"
  end
end 