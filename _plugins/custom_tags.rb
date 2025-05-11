module Jekyll
  class QuoteWithImageTag < Liquid::Block
    def initialize(tag_name, markup, tokens)
      super
      @image_path = markup.strip
    end

    def render(context)
      content = super
      site = context.registers[:site]
      converter = site.find_converter_instance(::Jekyll::Converters::Markdown)
      
      parsed_content = converter.convert(content)
      
      <<~HTML
        <div class="quote-with-image">
          <div class="quote-image">
            <img src="#{@image_path}" alt="Quote illustration">
          </div>
          <div class="quote-content">
            #{parsed_content}
          </div>
        </div>
      HTML
    end
  end

  class TilesContainerTag < Liquid::Block
    def initialize(tag_name, markup, tokens)
      super
      @markup = markup
    end

    def render(context)
      # Parse parameters
      params = {}
      @markup.scan(/(\w+)=['"]([^'"]+)['"]/) do |key, value|
        params[key] = value
      end
      
      size = params['size'] || 'small'
      
      content = super
      
      <<~HTML
        <div class="tiles-container-#{size}">
          #{content}
        </div>
      HTML
    end
  end

  class TileTag < Liquid::Tag
    def initialize(tag_name, markup, tokens)
      super
      @markup = markup
    end

    def render(context)
      # Parse parameters
      params = {}
      @markup.scan(/(\w+)=['"]([^'"]+)['"]/) do |key, value|
        params[key] = value
      end

      image = params['image'] || ''
      title = params['title'] || ''
      subtitle = params['subtitle'] || ''
      link = params['link'] || '#'
      
      <<~HTML
        <a href="#{link}" class="tile tile-#{params['size'] || 'small'}">
          <div class="tile-image" style="background-image: url('#{image}')"></div>
          <div class="tile-content">
            <h3 class="tile-title">#{title}</h3>
            <p class="tile-subtitle">#{subtitle}</p>
          </div>
        </a>
      HTML
    end
  end

  class RawHtmlTag < Liquid::Block
    def initialize(tag_name, markup, tokens)
      super
    end

    def render(context)
      super
    end
  end
end

Liquid::Template.register_tag('quote_with_image', Jekyll::QuoteWithImageTag)
Liquid::Template.register_tag('tile', Jekyll::TileTag)
Liquid::Template.register_tag('tiles_container', Jekyll::TilesContainerTag)
Liquid::Template.register_tag('raw_html', Jekyll::RawHtmlTag) 