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
  static defaultProps = {
    seen: [],
    style: {},
  };

  state = {
    expanded: this.props.expanded || false,
  };

  updateExpanded = (e) => {
    this.setState({expanded: e.target.checked});
  }

  render() {
    const { expanded } = this.state;
    const { crawl, url, showExternal, hideSeen, seen, style } = this.props;
    const { title, links } = crawl[url];

    const nextSeen = seen.concat(_.map(links, 'url'));

    return (
      <li>
        <div>
          <input type="checkbox" checked={ expanded } onChange={ this.updateExpanded }/>
          <a href={ url } style={ style } >{ title }</a>
        </div>

        <ul>
          { expanded ?
            _.uniq(links, l => l.url).map((link, i) => {
              let style;
              let hide;
              if (_.contains(seen, link.url)) {
                style = {};
                hide = true && hideSeen;
              } else {
                style = {backgroundColor: '#90EE90'};
                hide = false;
              }

              if (crawl[link.url] && !hide) {
                return <Tree key={ i } style={style} crawl={ crawl } url={ link.url } showExternal={ showExternal } hideSeen={ hideSeen } seen={ nextSeen } />;
              } else if (showExternal) {
                return <li key={ i }><a style={style} href={ link.url }>{ link.text.length > 0 ? link.text : link.url }</a></li>;
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
    const { crawl, base, showExternal, hideSeen } = this.props;

    return (
      <ul>
        { crawl[base] ? <Tree crawl={ crawl } url={ base } expanded={ true } showExternal={ showExternal } hideSeen={ hideSeen }/> : null }
      </ul>
    );
  }
}

class App extends Component {
  state = {
    crawl: null,
    base: "https://www.ycombinator.com",
    showExternal: false,
    hideSeen: false,
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

  updateHideSeen = (e) => {
    this.setState({hideSeen: e.target.checked});
  }

  render() {
    const { crawl, base, showExternal, hideSeen } = this.state;

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
        <label>
          Hide seen
          <input type="checkbox" checked={ hideSeen } onChange={ this.updateHideSeen } />
        </label>

        { crawl ? <CrawlViewer crawl={ crawl } base={ base } showExternal={ showExternal } hideSeen={ hideSeen } /> : null }
      </div>
    );
  }
}

function renderCrawlViewer(node) {
  ReactDOM.render(<App />, node);
}

window.renderCrawlViewer = renderCrawlViewer;
