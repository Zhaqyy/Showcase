import React, { Component } from "react";
import "../Style/Component.scss";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Showcase Error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) this.props.onRetry();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className='error-boundary'>
          <h3>Showcase Crashed</h3>
          <p>{this.state.error?.toString()}</p>
          <button onClick={this.handleRetry}>Retry</button>
          {this.props.onClose && <button onClick={this.props.onClose}>Back to Gallery</button>}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
