package com.energyaware

import com.facebook.react.bridge.ReactApplicationContext

class EnergyAwareModule(reactContext: ReactApplicationContext) :
  NativeEnergyAwareSpec(reactContext) {

  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  companion object {
    const val NAME = NativeEnergyAwareSpec.NAME
  }
}
