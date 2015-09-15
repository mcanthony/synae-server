import React from 'react/addons';

export default class extends React.Component {

  static propTypes = {
    groups: React.PropTypes.array.isRequired,
    onGroupSelect: React.PropTypes.func.isRequired
  }

  render() {
    return (
      <div className='flex flex-column'>
        <h1 style={{maxHeight:'10vh'}}className='px2'>Where Are You?</h1>
        <div className='flex'>
          <div style={{height: '35vh'}} className='flex-auto px2 py2'>
            <button
              key={this.props.groups[1].id}
              type='button'
              className='button button-big group-chooser-btn'
              style={{ color: this.props.groups[1].color, border: '1px solid #ddd', backgroundColor: 'transparent' }}
              onClick={this.props.onGroupSelect.bind(this, this.props.groups[1].id)}
              data-groupid={this.props.groups[1].id}
            >{this.props.groups[1].name}</button>
          </div>
          <div style={{height: '35vh'}} className='flex-auto px2 py2'>
            <button
              key={this.props.groups[0].id}
              type='button'
              className='button button-big group-chooser-btn'
              style={{ color: this.props.groups[0].color, border: '1px solid #ddd', backgroundColor: 'transparent' }}
              onClick={this.props.onGroupSelect.bind(this, this.props.groups[0].id)}
              data-groupid={this.props.groups[0].id}
            >{this.props.groups[0].name}</button>
          </div>
        </div>
        <div className='flex'>
          <div style={{height: '35vh'}} className='flex-auto px2 py2'>
            <button
              key={this.props.groups[2].id}
              type='button'
              className='button button-big group-chooser-btn'
              style={{ color: this.props.groups[2].color, border: '1px solid #ddd', backgroundColor: 'transparent' }}
              onClick={this.props.onGroupSelect.bind(this, this.props.groups[2].id)}
              data-groupid={this.props.groups[2].id}
            >{this.props.groups[2].name}</button>
          </div>
          <div style={{height: '35vh'}} className='flex-auto px2 py2'>
            <button
              key={this.props.groups[3].id}
              type='button'
              className='button button-big group-chooser-btn'
              style={{ color: this.props.groups[3].color, border: '1px solid #ddd', backgroundColor: 'transparent' }}
              onClick={this.props.onGroupSelect.bind(this, this.props.groups[3].id)}
              data-groupid={this.props.groups[3].id}
            >{this.props.groups[3].name}</button>
          </div>
        </div>
      </div>
    )
  }

}
