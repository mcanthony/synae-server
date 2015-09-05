import React from 'react/addons';

export default class SectionChooser extends React.Component {

  static propTypes = {
    groups: React.PropTypes.array.isRequired,
    onGroupSelect: React.PropTypes.func.isRequired
  }

  static defaultProps = {
    groups: [],
    onGroupSelect: null
  }

  render() {
    let groups = this.props.groups.map(g => {
      return (
        <button
          key={g.id}
          type='button'
          className='button button-big'
          onClick={this.props.onGroupSelect.bind(this, g.id)}
          data-groupid={g.id}
          >Group {g.name}</button>
      )
    });
    return (
      <div className=''>
        <h1 className='px2'>What Group Are You?</h1>
        <div className='flex flex-justify clearfix'>{groups}</div>
      </div>
    )
  }

}
