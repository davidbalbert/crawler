import "babel-polyfill";

import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import _ from 'underscore';

function readFile(f) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = (e) => { res(e.target.result) };
    reader.readAsText(f);
  });
}

class Tree extends Component {
  state = {
    expanded: this.props.expanded || false,
  };

  updateExpanded = (e) => {
    this.setState({expanded: e.target.checked});
  }

  render() {
    const { expanded } = this.state;
    const { crawl, url, showExternal } = this.props;
    const { title, links } = crawl[url];

    return (
      <li>
        <div>
          <input type="checkbox" checked={ expanded } onChange={ this.updateExpanded }/>
          <a href={ url }>{ title }</a>
        </div>

        <ul>
          { expanded ?
            _.uniq(links, l => l.url).map((link, i) => {
              if (crawl[link.url]) {
                return <Tree key={ i } crawl={ crawl } url={ link.url } />;
              } else if (showExternal) {
                return <li key={ i }><a href={ link.url }>{ link.text.length > 0 ? link.text : link.url }</a></li>;
              } else {
                return null;
              }
            })
            :
            null
          }
        </ul>
      </li>
    );
  }
}

class CrawlViewer extends Component {
  render() {
    const { crawl, base, showExternal } = this.props;

    return (
      <ul>
        { crawl[base] ? <Tree crawl={ crawl } url={ base } expanded={ true } showExternal={ showExternal } /> : null }
      </ul>
    );
  }
}

class App extends Component {
  state = {
    crawl: null,
    base: "https://www.ycombinator.com",
    showExternal: false,
  };

  loadFile = async (e) => {
    let s = await readFile(e.target.files[0]);
    this.setState({crawl: JSON.parse(s)});
  }

  updateBase = (e) => {
    this.setState({base: e.target.value});
  }

  updateShowExternal = (e) => {
    this.setState({showExternal: e.target.checked});
  }

  render() {
    const { crawl, base, showExternal } = this.state;

    return (
      <div>
        <h1>Crawl Viewer</h1>
        <input type="file" onChange={ this.loadFile } />
        <label>
          Root
          <input type="text" onChange={ this.updateBase } placeholder="base" value={ base } />
        </label>
        <label>
          Show external
          <input type="checkbox" checked={ showExternal } onChange={ this.updateShowExternal } />
        </label>

        { crawl ? <CrawlViewer crawl={ crawl } base={ base } showExternal={ showExternal } /> : null }
      </div>
    );
  }
}

function renderCrawlViewer(node) {
  ReactDOM.render(<App />, node);
}

window.renderCrawlViewer = renderCrawlViewer;
