import React from 'react/addons';

export default class extends React.Component {

  state = {
    step: 0
  }

  componentDidMount () {

    const maxSteps = 4;

    let next = () => {
      setTimeout(() => {
        this.setState({ step: ++this.state.step });
        if (this.state.step < maxSteps) next();
      }, 2000);
    }

    next();
  }

  render () {
    let { step } = this.state;
    return <div>
      <h1>Welcome!</h1>
      <ul>
        {step > 0 && <li>Make sure your Silent Switch is not on</li>}
        {step > 1 && <li>Enable Do Not Disturb if your phone has it</li>}
        {step > 2 && <li>Turn up your volume</li>}
        {step > 3 && <li><button
          class='button button-big'>Press and Listen for a Tone</button></li>}
      </ul>
    </div>
  }
}