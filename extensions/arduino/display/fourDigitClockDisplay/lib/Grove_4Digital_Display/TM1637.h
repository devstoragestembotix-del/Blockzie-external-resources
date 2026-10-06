/*
    TM1637.h
    A library for the 4 digit display

    TM1637 chip datasheet:
    https://www.mcielectronics.cl/website_MCI/static/documents/Datasheet_TM1637.pdf

    Copyright (c) 2012 seeed technology inc.
    Website    : www.seeed.cc
    Author     : Frankie.Chu
    Create Time: 9 April,2012
    Change Log :

    The MIT License (MIT)

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
*/

#ifndef TM1637_h
#define TM1637_h
#include <inttypes.h>
#include <Arduino.h>
/*******************Definitions for TM1637*********************/
#define ADDR_AUTO 0x40
#define ADDR_FIXED 0x44

#define STARTADDR 0xc0
/*****Definitions for the clock point of the digit tube *******/
#define POINT_ON 1
#define POINT_OFF 0
/**************Definitions for brightness**********************/
#define BRIGHT_DARKEST 0
#define BRIGHT_TYPICAL 2
#define BRIGHTEST 7
/**************Raw segment bit masks***************************/
#define SEG_A   0b00000001
#define SEG_B   0b00000010
#define SEG_C   0b00000100
#define SEG_D   0b00001000
#define SEG_E   0b00010000
#define SEG_F   0b00100000
#define SEG_G   0b01000000
#define SEG_DP  0b10000000

class TM1637 {
  public:
    TM1637(uint8_t, uint8_t);
    void init(void);               // To clear the display
    void display(uint8_t BitAddr, int8_t DispData);
    void displayNum(float num, int decimal = 0, bool show_minus = true);
    void displayStr(char str[],  uint16_t loop_delay = 500);
    void clearDisplay(void);
    void set(uint8_t = BRIGHT_TYPICAL, uint8_t = 0x40, uint8_t = 0xc0); //To take effect the next time it displays.
    void point(boolean PointFlag); //whether to light the clock point ":".To take effect the next time it displays.
    void showNumberDec(int num, bool leading_zero = false, uint8_t length = 4, uint8_t pos = 0);
    void showNumberDecEx(int num, uint8_t dots = 0, bool leading_zero = false, uint8_t length = 4, uint8_t pos = 0);
    void setSegments(const uint8_t segments[], uint8_t length = 4, uint8_t pos = 0);

    uint8_t cmd_set_data;
    uint8_t cmd_set_addr;
    uint8_t cmd_disp_ctrl;

  private:
    int writeByte(int8_t wr_data); // Write 8bit data to tm1637
    void start(void);              // Send start bits
    void stop(void);               // Send stop bits
    void display(int8_t DispData[]);
    void coding(int8_t DispData[]);
    int8_t coding(int8_t DispData);
    void bitDelay(void);
    void showNumberBaseEx(int8_t base, uint16_t num, uint8_t dots, bool leading_zero, uint8_t length, uint8_t pos);

    const int DIGITS = 4; // Number of digits on display
    uint8_t clkpin;
    uint8_t datapin;
    boolean _PointFlag;            //_PointFlag=1:the clock point on
};
#endif
