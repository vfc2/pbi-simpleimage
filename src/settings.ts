/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

/**
 * Image settings Formatting Card
 */

class ImageSettingsCardSettings extends FormattingSettingsCard {
    scalingMode = new formattingSettings.AutoDropdown({
        name: "scalingMode",
        displayName: "Scaling mode",
        value: "normal"
    });

    imageAlignment = new formattingSettings.AutoDropdown({
        name: "imageAlignment",
        displayName: "Image alignment",
        value: "left"
    });

    name: string = "imageSettings";
    displayName: string = "Image settings";

    slices: Array<FormattingSettingsSlice> = [this.scalingMode, this.imageAlignment];
}

class AltTextSettings extends FormattingSettingsCard {
    showAltText = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: undefined,
        value: true
    });

    fontControl = new formattingSettings.FontControl({
        name: "fontControlGroup",
        displayName: "Font",
        fontFamily: new formattingSettings.FontPicker({
            name: "fontFamily",
            displayName: "Font family",
            value: "Segoe UI"
        }),
        fontSize: new formattingSettings.NumUpDown({
            name: "fontSize",
            displayName: "Text size",
            value: 12
        }),
        bold: new formattingSettings.ToggleSwitch({
            name: "fontBold",
            displayName: "Bold",
            value: false
        }),
        italic: new formattingSettings.ToggleSwitch({
            name: "fontItalic",
            displayName: "Italic",
            value: false
        }),
        underline: new formattingSettings.ToggleSwitch({
            name: "fontUnderline",
            displayName: "Underline",
            value: false
        })
    });

    fontColor = new formattingSettings.ColorPicker({
        name: "fontColor",
        displayName: "Font color",
        value: { value: "#000000" }
    });

    textHorizontalAlign = new formattingSettings.AlignmentGroup({
        name: "textHorizontalAlign",
        displayName: "Horizontal alignment",
        value: "left",
        mode: powerbi.visuals.AlignmentGroupMode.Horizonal
    });

    textVerticalAlign = new formattingSettings.AlignmentGroup({
        name: "textVerticalAlign",
        displayName: "Vertical alignment",
        value: "top",
        mode: powerbi.visuals.AlignmentGroupMode.Vertical
    });

    name: string = "altTextSettings";
    displayName: string = "Alternative text settings";
    topLevelSlice: formattingSettings.ToggleSwitch = this.showAltText;

    slices: Array<FormattingSettingsSlice> = [this.fontControl, this.fontColor, this.textHorizontalAlign, this.textVerticalAlign];
}

/**
* visual settings model class
*
*/
export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    // Create formatting settings model formatting cards
    imageSettingsCard = new ImageSettingsCardSettings();
    altTextSettingsCard = new AltTextSettings();

    cards = [this.imageSettingsCard, this.altTextSettingsCard];
}
