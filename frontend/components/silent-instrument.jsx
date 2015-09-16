import React from 'react/addons';

export default class extends React.Component {
  render () {
    return <div>
      <h1 style={{
        textAlign: 'center',
        marginTop: '45vh',
        marginLeft: '10vw',
        marginRight: '10vw'
      }}>{this.props.instructions}</h1>
    </div>
  }
}
