'use strict';

goog.provide('Blockly.FieldMatrix');
goog.require('Blockly.Field');
goog.require('Blockly.fieldRegistry');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.Size');

Blockly.FieldMatrix = function(value) {
  this.columns_ = 7;      // 7 columns
  this.rows_ = 5;         // 5 rows
  this.total_ = 35;       // 7x5 = 35 LEDs
  this.value_ = value || '0'.repeat(this.total_);
  Blockly.FieldMatrix.superClass_.constructor.call(this, this.value_);
};

Blockly.utils.object.inherits(Blockly.FieldMatrix, Blockly.Field);

Blockly.FieldMatrix.fromJson = function() {
  return new Blockly.FieldMatrix('0'.repeat(35));
};

Blockly.FieldMatrix.prototype.createSVG_ = function() {
  this.svgRoot_ = Blockly.utils.dom.createSvgElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'viewBox': '0 0 180 180',
    'width': '180',
    'height': '180'
  }, this.fieldGroup_);

  this.rects_ = [];
  const cellSize = 20;
  const padding = 5;

  for (let y = 0; y < this.rows_; y++) {
    for (let x = 0; x < this.columns_; x++) {
      const rectX = padding + x * (cellSize + padding);
      const rectY = padding + y * (cellSize + padding);
      const rect = Blockly.utils.dom.createSvgElement('rect', {
        'x': rectX,
        'y': rectY,
        'width': cellSize,
        'height': cellSize,
        'rx': 3,
        'ry': 3,
        'fill': '#333',
        'stroke': '#666',
        'stroke-width': '1'
      }, this.svgRoot_);

      rect.index = y * this.columns_ + x;
      rect.addEventListener('click', this.onClick_.bind(this));
      this.rects_.push(rect);
    }
  }
};

Blockly.FieldMatrix.prototype.onClick_ = function(e) {
  const index = e.target.index;
  const newValue = this.value_.split('');
  newValue[index] = newValue[index] === '1' ? '0' : '1';
  this.value_ = newValue.join('');
  this.setValue(this.value_);
  this.render_();
};

Blockly.FieldMatrix.prototype.render_ = function() {
  for (let i = 0; i < this.total_; i++) {
    this.rects_[i].setAttribute('fill', this.value_[i] === '1' ? '#00FF00' : '#333');
  }
};

Blockly.FieldMatrix.prototype.getValue = function() {
  return this.value_;
};

Blockly.FieldMatrix.prototype.setValue = function(newValue) {
  if (newValue.length === this.total_) {
    this.value_ = newValue;
    if (this.svgRoot_) this.render_();
  }
};

Blockly.fieldRegistry.register('field_matrix', Blockly.FieldMatrix);