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
        <% include Banner Text=$BannerText, Size=large %>
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
        <% include CallToAction %>
    </section>
<% end_if %>
```

`$ ss-to-react app/templates/Includes/ my-react-app/components`

#### Output

*my-react-app/components/Includes/MyBlock.js*

```js
import React from 'react';
import Banner from '../components/Banner';
import CallToAction from '../components/CallToAction';

const MyBlock = (props) => {
    return (
    {/*  if {props.Title} || {props.Lead}  */}
    <section className="hero-block">
      <Banner text={props.BannerText} Size="large" />
      <div className="container">
        <div className="row">
          <div className="col col-md-8 offset-md-2">
            {/*  if {props.Title}  */}
            <h1 className="hero-block__text hero-block__text--title">{props.Title}</h1>
            {/*  end_if  */}
            {/*  if {props.Lead}  */}
            <p className="lead hero-block__text hero-block__text--lead">{props.Lead}</p>
            {/*  end_if  */}
          </div>
        </div>
      </div>
      <CallToAction />
    </section>
    {/*  end_if  */}
    );
};

export default MyBlock;
```

### Namespace resolution and organisation

Templates will not preserve their fully-qualified namespaces. If you have templates of the same name in multiple
namespaces, they will get overwritten without conflict resolution at the moment.

* All `Layout/` templates will go into a subdirectory called `Layout/`, regardless of their namespace.
* All `Includes/` templates will go into a subdirectory called `components/`, regardless of their namespace.
* All other templates are considered to be top level pages and go in the root directory of your destination.

#### Example
```
.
└── app/
    └── templates/
        ├── Includes/
        │   └── Banner.ss
        ├── Layout/
        │   └── Page.ss
        ├── MyVendor/
        │   └── MyApp/
        │       ├── Pages/
        │       ├── Includes/
        │       │   └── NavBar.ss
        │       └── Layout/
        │           ├── MySpecialPage.ss
        │           └── MyPage.ss
        └── Page.ss
```

The result of this export is:

```
.
└── my-export-dir/
    ├── Page.js
    ├── MyPage.js
    ├── Layout/
    │   ├── Page.js
    │   └── MySpecialPage.js
    └── components/
        ├── Banner.js
        └── NavBar.js
```        