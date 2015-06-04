import React from 'react/addons';

/*export default React.createClass({
  //displayName: 'SectionChooser',
  render: function() {
    let sections = this.props.audienceSections;
    return (
      <div>
      <h1>What Audience Section Are You?</h1>
      {sections.map(function(p) {
        return (<a href="/section" key={p} className="button button-big">{p.toUpperCase()}</a>)
      })}
      </div>
    )
  }
});*/

export default class SectionChooser extends React.Component {

  render() {
    let sections = this.props.audienceSections;
    return (
      <div>
      <h1>What Audience Section Are You?</h1>
      {sections.map(function(p) {
        return (<a href="/section" key={p} className="button button-big">{p.toUpperCase()}</a>)
      })}
      </div>
    )
  }

}
