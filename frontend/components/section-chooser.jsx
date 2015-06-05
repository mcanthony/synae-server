import React from 'react/addons';

export default class SectionChooser extends React.Component {

  constructor(props) {
    super(props);
    this.handleSectionSelect = this.handleSectionSelect.bind(this);
    this.state = {
      audienceSections: props.audienceSections.map( id => {
        return {
          id,
          disabled: false
        }
      })
    }
  }

  handleSectionSelect(id, e) {
    this.state.audienceSections.forEach(s => s.disabled = true);
    this.setState({
      audienceSections: this.state.audienceSections
    });
    this.props.onSectionSelect(id)
  }

  render() {
    let self = this;
    let sections = this.state.audienceSections;
    return (
      <div className="">
        <h1 className="px2">What Audience Section Are You?</h1>
        <div className="flex flex-justify clearfix">
        {sections.map(function(p) {
          return (
            <button
              key={p.id}
              type="button"
              disabled={p.disabled}
              className="button button-big"
              onClick={self.handleSectionSelect.bind(self, p.id)}
              data-sectionid={p.id}
              >Section {p.id.toUpperCase()}</button>
          )
        })}
        </div>
      </div>
    )
  }

}
