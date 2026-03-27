/**
 * GyanBit Studio — MicroPython Code Generator
 * Generates a ready-to-flash .py file for the real GyanBit hardware:
 *   - Raspberry Pi Pico (RP2040)
 *   - 1.3" SH1106/SSD1306 OLED (I2C: SDA=GP16, SCL=GP17)
 *   - 6 tactile buttons on GP2-GP7
 *   - PAM8403 audio amp driven by PWM on GP15
 *   - TP4056 Li-Ion charging via USB
 */

export function generateMicroPython(userCode = '') {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);

  // Clean up JS-specific bits before embedding as comment
  const codeComment = userCode
    .split('\n')
    .map(l => '# ' + l)
    .join('\n');

  return `# ============================================================
# GyanBit Studio — Generated MicroPython
# Date: ${dateStr}
# Target: Raspberry Pi Pico (RP2040) + SH1106/SSD1306 OLED
# ============================================================
# HARDWARE:
#   Display : 1.3" OLED 128x64, I2C addr 0x3C
#             SDA → GP16,  SCL → GP17
#   Buttons : UP=GP2 DOWN=GP3 LEFT=GP4 RIGHT=GP5 A=GP6 B=GP7
#   Audio   : PWM on GP15 → PAM8403 analog input
#   Power   : TP4056 Li-Ion charger (USB-C input)
# ============================================================

import machine
import time
import math
import random

# ── I2C + OLED Setup ────────────────────────────────────────
i2c = machine.I2C(0, sda=machine.Pin(16), scl=machine.Pin(17), freq=400_000)

# Try SH1106 first (more common 1.3"), fall back to SSD1306
try:
    import sh1106
    oled = sh1106.SH1106_I2C(128, 64, i2c, addr=0x3C)
    print("Display: SH1106")
except ImportError:
    import ssd1306
    oled = ssd1306.SSD1306_I2C(128, 64, i2c)
    print("Display: SSD1306")

# ── Button Setup (active LOW — pressed = 0) ─────────────────
BTN_UP    = machine.Pin(2, machine.Pin.IN, machine.Pin.PULL_UP)
BTN_DOWN  = machine.Pin(3, machine.Pin.IN, machine.Pin.PULL_UP)
BTN_LEFT  = machine.Pin(4, machine.Pin.IN, machine.Pin.PULL_UP)
BTN_RIGHT = machine.Pin(5, machine.Pin.IN, machine.Pin.PULL_UP)
BTN_A     = machine.Pin(6, machine.Pin.IN, machine.Pin.PULL_UP)
BTN_B     = machine.Pin(7, machine.Pin.IN, machine.Pin.PULL_UP)

# Helper: returns True if button is pressed
def pressed(pin):
    return pin.value() == 0

# ── PWM Audio on GP15 (PAM8403 analog input) ────────────────
audio_pwm = machine.PWM(machine.Pin(15))
audio_pwm.freq(440)
audio_pwm.duty_u16(0)  # silent by default

def beep(freq_hz, duration_ms):
    """Play a square-wave beep at given frequency for given milliseconds."""
    audio_pwm.freq(int(freq_hz))
    audio_pwm.duty_u16(32768)   # 50% duty = square wave
    time.sleep_ms(duration_ms)
    audio_pwm.duty_u16(0)       # silence

def melody(notes):
    """Play a list of (freq_hz, duration_ms) note pairs."""
    for freq, dur in notes:
        if freq == 0:
            time.sleep_ms(dur)  # rest
        else:
            beep(freq, dur)
        time.sleep_ms(20)       # small gap between notes

# ── Boot Animation (GyanBit logo on OLED) ───────────────────
def boot_screen():
    oled.fill(0)
    # Draw pixel-art GB logo (simplified 'GB' in big pixels)
    logo = [
        "  GG  BB   ",
        " G  G B  B ",
        " G    BBB  ",
        " G GG B  B ",
        "  GG  BB   ",
    ]
    for row, line in enumerate(logo):
        for col, ch in enumerate(line):
            if ch != ' ':
                oled.fill_rect(col * 11, row * 9 + 2, 9, 7, 1)
    oled.text("GyanBit", 30, 46)
    oled.text("v1.0", 48, 56)
    oled.show()
    # Two-tone startup beep
    beep(523, 120)   # C5
    beep(659, 180)   # E5
    time.sleep_ms(600)

boot_screen()

# ── Drawing Helpers ──────────────────────────────────────────
class Bit:
    W = 128
    H = 64

    @staticmethod
    def clear():
        oled.fill(0)

    @staticmethod
    def dot(x, y):
        oled.pixel(int(x), int(y), 1)

    @staticmethod
    def erase(x, y):
        oled.pixel(int(x), int(y), 0)

    @staticmethod
    def line(x1, y1, x2, y2):
        # Bresenham line algorithm
        x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
        dx, dy = abs(x2-x1), abs(y2-y1)
        sx, sy = (1 if x1<x2 else -1), (1 if y1<y2 else -1)
        err = dx - dy
        while True:
            oled.pixel(x1, y1, 1)
            if x1 == x2 and y1 == y2: break
            e2 = 2*err
            if e2 > -dy: err -= dy; x1 += sx
            if e2 <  dx: err += dx; y1 += sy

    @staticmethod
    def box(x, y, w, h):
        oled.rect(int(x), int(y), int(w), int(h), 1)

    @staticmethod
    def fill(x, y, w, h):
        oled.fill_rect(int(x), int(y), int(w), int(h), 1)

    @staticmethod
    def text(x, y, s):
        oled.text(str(s), int(x), int(y))

    @staticmethod
    def show():
        oled.show()

bit = Bit()

# ── Button state tracking ────────────────────────────────────
btn_pins = {
    'up':    BTN_UP,
    'down':  BTN_DOWN,
    'left':  BTN_LEFT,
    'right': BTN_RIGHT,
    'a':     BTN_A,
    'b':     BTN_B,
}

def any_pressed():
    return any(p.value() == 0 for p in btn_pins.values())

# ============================================================
# YOUR GAME CODE GOES BELOW
# (The JS code from GyanBit Studio is shown as reference)
# ============================================================
#
# Original Studio code:
${codeComment}
#
# ── Example game loop structure ──────────────────────────────
# score = 0
# player_x = 64
#
# while True:
#     if pressed(BTN_LEFT)  and player_x > 0:  player_x -= 2
#     if pressed(BTN_RIGHT) and player_x < 127: player_x += 2
#
#     bit.clear()
#     bit.fill(player_x - 3, 54, 6, 4)   # draw player
#     bit.text(0, 0, "SCORE:" + str(score))
#     bit.show()
#     time.sleep_ms(33)   # ~30fps
`;
}
