'use strict';

import React from 'react';
import EventHandlersMixin from './mixins/event-handlers';
import HelpersMixin from './mixins/helpers';
import initialState from './initial-state';
import defaultProps from './default-props';
import classnames from 'classnames';

import {Track} from './track';
import {Dots} from './dots';
import {PrevArrow, NextArrow} from './arrows';

export var InnerSlider = React.createClass({
  mixins: [HelpersMixin, EventHandlersMixin],
  getInitialState: function () {
    return initialState;
  },
  getDefaultProps: function () {
    return defaultProps;
  },
  componentWillMount: function () {
    if (this.props.init) {
      this.props.init();
    }
    this.setState({
      mounted: true
    });
    var lazyLoadedList = [];
    for (var i = 0; i < this.props.children.length; i++) {
      if (i >= this.state.currentSlide && i < this.state.currentSlide + this.props.slidesToShow) {
        lazyLoadedList.push(i);
      }
    }

    if (this.props.lazyLoad && this.state.lazyLoadedList.length === 0) {
      this.setState({
        lazyLoadedList: lazyLoadedList
      });
    }
  },
  componentDidMount: function componentDidMount() {
    // Hack for autoplay -- Inspect Later
    this.initialize(this.props);
    this.adaptHeight();

    if (window.addEventListener) {
      window.addEventListener('resize', this.onWindowResized);
      window.addEventListener('blur', this.onWindowInactive);
      window.addEventListener('focus', this.onWindowActive);
    } else {
      window.attachEvent('onresize', this.onWindowResized);
      window.attachEvent('blur', this.onWindowInactive);
      window.attachEvent('focus', this.onWindowActive);
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    if (window.addEventListener) {
      window.removeEventListener('resize', this.onWindowResized);
      window.removeEventListener('blur', this.onWindowInactive);
      window.removeEventListener('focus', this.onWindowActive);
    } else {
      window.detachEvent('onresize', this.onWindowResized);
      window.detachEvent('blur', this.onWindowInactive);
      window.detachEvent('focus', this.onWindowActive);
    }

    if (this.state.autoPlayTimer) {
      window.clearTimeout(this.state.autoPlayTimer);
    }
  },
  componentWillReceiveProps: function(nextProps) {
    // Only do this if prop is properly set, otherwise keep things normal
    if (Number.isInteger(nextProps.slickGoTo)) {
      setTimeout(() => this.changeSlide({index: nextProps.slickGoTo}));
    }

    this.update(nextProps);
  },
  componentDidUpdate: function () {
    this.adaptHeight();
  },
  onWindowResized: function () {
    this.update(this.props);
  },
  onWindowInactive: function () {
    if (this.state.autoPlayTimer) {
      window.clearTimeout(this.state.autoPlayTimer);
    }
  },
  onWindowActive: function () {
    this.autoPlay();
  },
  prevArrowClick(options) {
    const {onArrowsClick} = this.props;

    if (typeof onArrowsClick === 'function') {
      const {currentSlide, slideCount} = this.state;

      return onArrowsClick(
          'prev',
          currentSlide,
          currentSlide === 0 ? slideCount - 1 : currentSlide - 1
      );
    }

    this.changeSlide(options);
  },
  nextArrowClick(options) {
    const {onArrowsClick} = this.props;

    if (typeof onArrowsClick === 'function') {
      const {currentSlide, slideCount} = this.state;

      return onArrowsClick(
          'next',
          currentSlide,
          currentSlide === (slideCount - 1) ? 0 : currentSlide + 1
      );
    }

    this.changeSlide(options);
  },
  render: function () {
    var className = classnames('slick-initialized', 'slick-slider', this.props.className);

    var trackProps = {
      fade: this.props.fade,
      cssEase: this.props.cssEase,
      speed: this.props.speed,
      infinite: this.props.infinite,
      centerMode: this.props.centerMode,
      currentSlide: this.state.currentSlide,
      lazyLoad: this.props.lazyLoad,
      lazyLoadedList: this.state.lazyLoadedList,
      rtl: this.props.rtl,
      slideWidth: this.state.slideWidth,
      slidesToShow: this.props.slidesToShow,
      slideCount: this.state.slideCount,
      trackStyle: this.state.trackStyle,
      variableWidth: this.props.variableWidth
    };

    var dots;

    if (this.props.dots === true && this.state.slideCount > this.props.slidesToShow) {
      var dotProps = {
        dotsClass: this.props.dotsClass,
        slideCount: this.state.slideCount,
        slidesToShow: this.props.slidesToShow,
        currentSlide: this.state.currentSlide,
        slidesToScroll: this.props.slidesToScroll,
        clickHandler: this.changeSlide
      };

      dots = (<Dots {...dotProps} />);
    }

    var prevArrow, nextArrow;

    var arrowProps = {
      infinite: this.props.infinite,
      centerMode: this.props.centerMode,
      currentSlide: this.state.currentSlide,
      slideCount: this.state.slideCount,
      slidesToShow: this.props.slidesToShow,
      prevArrow: this.props.prevArrow,
      nextArrow: this.props.nextArrow
    };

    if (this.props.arrows) {
      prevArrow = (<PrevArrow {...arrowProps} clickHandler={this.prevArrowClick} />);
      nextArrow = (<NextArrow {...arrowProps} clickHandler={this.nextArrowClick} />);
    }

    return (
      <div className={className}>
        <div
          ref='list'
          className="slick-list"
          onMouseDown={this.swipeStart}
          onMouseMove={this.state.dragging ? this.swipeMove: null}
          onMouseUp={this.swipeEnd}
          onMouseLeave={this.state.dragging ? this.swipeEnd: null}
          onTouchStart={this.swipeStart}
          onTouchMove={this.state.dragging ? this.swipeMove: null}
          onTouchEnd={this.swipeEnd}
          onTouchCancel={this.state.dragging ? this.swipeEnd: null}>
          <Track ref='track' {...trackProps}>
            {this.props.children}
          </Track>
        </div>
        {prevArrow}
        {nextArrow}
        {dots}
      </div>
    );
  }
});
