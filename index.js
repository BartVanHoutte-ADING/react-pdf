/**
 * @jsx React.DOM
 */
var React = require('react');

function forPdfPage(pdf){
  var self = this;
  self.setState({pdf: pdf, pages: pdf.numPages});
  pdf.getPage(self.props.page).then(function(pdfPage){
    self.setState({pdfPage: pdfPage, page: self.props.page});
      if(!!self.props.onCompleted && typeof self.props.onCompleted === 'function'){
        self.props.onCompleted(Math.min(pdfPage.pageIndex + 1, pdf.numPages), pdf.numPages)
      }	  
  });
}

var Pdf = React.createClass({
  displayName: 'React-PDF',
  propTypes: {
    file: React.PropTypes.string,
    content: React.PropTypes.string,
    page: React.PropTypes.number,
    scale: React.PropTypes.number,
    onCompleted: React.PropTypes.func
  },
  getInitialState: function() {
    return {page: 0, pages: 0,};
  },
  getDefaultProps: function() {
    return {page: 1, scale: 1.0};
  },
  componentDidMount: function() {
    var self = this;
    if(!!this.props.file){
      PDFJS.getDocument(this.props.file).then(forPdfPage.bind(this));
    }
    if(!!this.props.content){
      var bytes = window.atob(this.props.content);
      var byteLength = bytes.length;
      var byteArray = new Uint8Array(new ArrayBuffer(byteLength));
      for(index = 0; index < byteLength; index++) {
        byteArray[index] = bytes.charCodeAt(index);
      }
      PDFJS.getDocument(byteArray).then(forPdfPage.bind(this));	  
    }
  },
  componentWillReceiveProps: function(newProps) {
    var self = this;
    if (!!newProps.page && !!self.state.pdf) {
      self.state.pdf.getPage(newProps.page).then(function(pdfPage) {
        self.setState({pdfPage: pdfPage, page: newProps.page});
      });
    }
    this.setState({
      pdfPage: null
    });
  },
  render: function() {
    var self = this;
    if (!!this.state.pdfPage){
      setTimeout(function() {
        var canvas = self.refs.pdfCanvas.getDOMNode(),
          context = canvas.getContext('2d'),
          scale = self.props.scale,
          viewport = self.state.pdfPage.getViewport(scale);
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        var renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        self.state.pdfPage.render(renderContext);
      }, 10);
      return (<canvas ref="pdfCanvas"></canvas>);
    }
    return (this.props.loading || <div>Loading pdf..</div>);
  }
});

module.exports = Pdf;
