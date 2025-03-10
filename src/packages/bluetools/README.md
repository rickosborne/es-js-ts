# @rickosborne/bluetools

TypeScript/ES/JS for working with Bluetooth devices via node.

This library _does not_ attempt to do all the low-level [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API) stuff.
Instead, it contains a bunch of types, classes, and functions auto-generated from the Bluetooth Characteristic and Descriptor reference XML.

Basically, it attempts to help with that annoying step of "okay, I got my nodejs/browser talking to the device, now how do I read the data?" part.

> ⚠️⚠️⚠️ ***This library does not attempt to cover the various edge cases of the real world or the Web Bluetooth spec.*** ⚠️⚠️⚠️

Indeed, I probably got a bunch of stuff wrong, as the source XML files for the data specs have almost zero examples.
I've tested it on a few of my own devices (heart rate monitors, mostly), but I don't claim that all the fiddly stuff will actually work.
Use at your own risk.  YMMV.  All that.

As most of the code in this library is auto-generated, it all follows the same pattern:

- An interface for the fields parsed from the Characteristic / Descriptor.
- A class which implements that interface, and also holds static constants like the UUID and Name.
- A parser function which can read a `DataView` and generate instances of the class.

I have not converted _all_ the Characteristics or Descriptors.
If you have access to one of the XML sources you'd like to see added, file a GitHub issue.
You can also try generating them on your own using the `scripts/from-xml.ts` and `scripts/gatt-assigned.ts` scripts.
The former does most of the code generation, while the latter just adds to the UUID records.

> ⚠️⚠️⚠️ The code here is based off the circa 2017 XML specs, ***not*** the circa 2020 YAML specs.  The code may be out of date.  ⚠️⚠️⚠️

The YAML specs don't have nearly as much detail, and would be much harder to convert.
You can see them here:

https://bitbucket.org/bluetooth-SIG/public/src/main/gss/

Sadly, the XML versions have been removed.
Though, if you were industrious, you could find them.
