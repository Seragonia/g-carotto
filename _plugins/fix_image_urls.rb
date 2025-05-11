Jekyll::Hooks.register :site, :post_write do |site|
  # Skip if no baseurl is configured
  baseurl = site.config['baseurl'] || ''
  next if baseurl.empty?
  
  # Clean baseurl (ensure no trailing slash)
  baseurl = baseurl.end_with?('/') ? baseurl[0..-2] : baseurl
  
  # Get site destination directory
  site_dir = site.config['destination']
  
  # Process all HTML files
  Dir.glob("#{site_dir}/**/*.html").each do |file_path|
    content = File.read(file_path)
    
    # Replace all img src attributes that start with '/'
    modified_content = content.gsub(/(src|href)=["'](\/[^"']*)["']/) do |match|
      attr, path = $1, $2
      
      # Skip if the path already contains the baseurl
      if path.start_with?(baseurl)
        match
      else
        # Add baseurl to the path
        %(#{attr}="#{baseurl}#{path}")
      end
    end
    
    # Replace all CSS background-image URLs
    modified_content = modified_content.gsub(/url\(['"]?(\/[^'"\)]+)['"]?\)/i) do |match|
      path = $1
      
      # Skip if the path already contains the baseurl
      if path.start_with?(baseurl)
        match
      else
        # Add baseurl to the path
        "url('#{baseurl}#{path}')"
      end
    end
    
    # Write the modified content back to the file
    File.write(file_path, modified_content)
  end
end 