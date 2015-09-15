import React from 'react/addons';

export default class extends React.Component {

  static propTypes = {
    groups: React.PropTypes.array.isRequired,
    onGroupSelect: React.PropTypes.func.isRequired
  }

  render() {
    let groups = this.props.groups.map(g => {
      return (
        <button
          key={g.id}
          type='button'
          className='button button-big'
          style={{ backgroundColor: g.color }}
          onClick={this.props.onGroupSelect.bind(this, g.id)}
          data-groupid={g.id}
          >{g.name}</button>
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
