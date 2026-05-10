# LinkPicker Component

A reusable link picker component for WordPress Gutenberg blocks.

## Features

- **LinkControl Integration**: Full WordPress LinkControl with URL suggestions, post/page selection, and text input
- **Unified Settings**: "Open in new tab" and "No Follow" controls integrated seamlessly within LinkControl
- **Popover Interface**: Appears below toolbar button (no center-screen modals)
- **Rel Attribute Management**: Handles `rel` attributes directly within the link object
- **Simplified API**: Easy to integrate with minimal props required

## Usage

```jsx
import LinkPicker from '../../components/LinkPicker';

export default function Edit({ attributes, setAttributes }) {
  const { link } = attributes;

  return (
    <>
      <LinkPicker
        link={link}
        onLinkChange={(newLink) => setAttributes({ link: newLink })}
      />
      
      {/* Your block content */}
    </>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `link` | Object | `{}` | Link object with `url`, `target`, `title`, `rel` |
| `onLinkChange` | Function | - | Callback when link changes |
| `addLabel` | String | `'Add Link'` | Label for add link button |
| `editLabel` | String | `'Edit Link'` | Label for edit link button |
| `removeLabel` | String | `'Remove Link'` | Label for remove link button |
| `showRemoveButton` | Boolean | `true` | Whether to show remove button |
| `className` | String | `''` | Additional CSS class |

## Block Attributes

Your block should include these attributes:

```json
{
  "link": {
    "type": "object",
    "default": {
      "url": "",
      "target": false,
      "title": "",
      "rel": ""
    }
  }
}
```

## Frontend Rendering

```php
$link = $attributes['link'] ?? [];
$linkUrl = $link['url'] ?? '';
$linkTitle = $link['title'] ?? '';
$target = $link['target'] ?? false;
$linkRel = $link['rel'] ?? '';

if ($linkUrl) {
  $rel_attributes = [];
  if ($target) {
    $rel_attributes[] = 'noopener';
    $rel_attributes[] = 'noreferrer';
  }
  // Add custom rel attributes from link.rel
  if ($linkRel) {
    $customRelArray = array_filter(array_map('trim', explode(' ', $linkRel)));
    $rel_attributes = array_merge($rel_attributes, $customRelArray);
  }
  $rel_string = !empty($rel_attributes) ? ' rel="' . esc_attr(implode(' ', array_unique($rel_attributes))) . '"' : '';
  $title_attr = $linkTitle ? ' title="' . esc_attr($linkTitle) . '"' : '';
  
  echo '<a href="' . esc_url($linkUrl) . '"' . ($target ? ' target="_blank"' : '') . $rel_string . $title_attr . '>';
  // Your content
  echo '</a>';
}
```
