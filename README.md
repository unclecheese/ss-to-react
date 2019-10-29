## ss-to-react

Convert Silverstripe CMS `.ss` templates to React components.

### Installation

`$ npm install -g ss-to-react`

### Usage

`$ ss-to-react <source-dir> <output-dir>`

### Examples

*app/templates/Includes/MyBlock.ss*
```html
<% if $Title || $Lead %>
    <section class="hero-block">
        <div class="container">
            <div class="row">
                <div class="col col-md-8 offset-md-2">
                    <% if $Title %>
                        <h1 class="hero-block__text hero-block__text--title">$Title</h1>
                    <% end_if %>

                    <% if $Lead %>
                        <p class="lead hero-block__text hero-block__text--lead">$Lead</p>
                    <% end_if %>
                </div>
            </div>
        </div>
    </section>
<% end_if %>
```

`$ ss-to-react app/templates/Includes/ my-react-app/components`

#### Output

*my-react-app/components/Includes/MyBlock.jsx*

```js
import React from 'react';

const MyBlock = () => {
    return (
		{/*  if $Title || $Lead  */}
		<section className="hero-block">
		  <div className="container">
		    <div className="row">
		      <div className="col col-md-8 offset-md-2">
		        {/*  if $Title  */}
		        <h1 className="hero-block__text hero-block__text--title">$Title</h1>
		        {/*  end_if  */}
		        {/*  if $Lead  */}
		        <p className="lead hero-block__text hero-block__text--lead">$Lead</p>
		        {/*  end_if  */}
		      </div>
		    </div>
		  </div>
		</section>
		{/*  end_if  */}
		
    );
};

export default MyBlock;
```




