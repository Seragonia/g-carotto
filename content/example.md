---
title: Markdown Extensions Demo
layout: page
---

<!-- this page is not rendered -->

## Quote with Image

{% quote_with_image /assets/img/npc/NPC02_109_qishichengzhumaigenensi.jpg %}
This is a quote with an image on the left. You can write multiple paragraphs here.

The image path is provided as a parameter to the tag.
{% endquote_with_image %}

## Tiles

### Simple Tiles (4 per row)

{% tiles_container size='small' %}
{% tile image='/assets/images/example1.jpg' title='Simple Tile 1' subtitle='Click me to go somewhere' link='/some-page' %}
{% tile image='/assets/images/example1.jpg' title='Simple Tile 2' subtitle='Click me to go somewhere' link='/some-page' %}
{% tile image='/assets/images/example1.jpg' title='Simple Tile 3' subtitle='Click me to go somewhere' link='/some-page' %}
{% tile image='/assets/images/example1.jpg' title='Simple Tile 4' subtitle='Click me to go somewhere' link='/some-page' %}
{% endtiles_container %}

### Medium Tiles (2 per row)

{% tiles_container size='medium' %}
{% tile image='/assets/images/example2.jpg' title='Medium Tile 1' subtitle='This is the default size' link='/another-page' %}
{% tile image='/assets/images/example2.jpg' title='Medium Tile 2' subtitle='This is the default size' link='/another-page' %}
{% endtiles_container %}

### Large Tile (1 per row)

{% tiles_container size='large' %}
{% tile image='/assets/images/example4.jpg' title='Large Tile' subtitle='When you need more visual impact' link='/large-page' %}
{% endtiles_container %}

## Raw HTML

{% raw_html %}
<div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px;">
  <h3>This is raw HTML</h3>
  <p>You can use any HTML tags here, with <strong>formatting</strong>, <em>styling</em>, and more.</p>
  <button onclick="alert('Hello!')">Click me</button>
</div>
{% endraw_html %} 