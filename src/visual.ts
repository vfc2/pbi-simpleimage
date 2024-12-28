/*
*  Power BI Visual CLI
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

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualEventService = powerbi.extensibility.IVisualEventService;

import { VisualFormattingSettingsModel } from "./settings";

enum ScalingMode {
    Normal = "Normal",
    Fit = "Fit",
    None = "None"
}

enum VerticalAlignment {
    Top = "top",
    Middle = "middle",
    Bottom = "bottom"
}

enum ImageAlignment {
    TopLeft = "left",
    TopCenter = "center",
    TopRight = "right",
    MiddleLeft = "mleft",
    MiddleCenter = "mcenter",
    MiddleRight = "mright",
    BottomLeft = "bleft",
    BottomCenter = "bcenter",
    BottomRight = "bright"
}

export class Visual implements IVisual {
    private target: HTMLElement;
    private imgElement: HTMLImageElement;
    private altElement: HTMLParagraphElement;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private events: IVisualEventService;

    constructor(options: VisualConstructorOptions) {
        options.host.hostCapabilities.allowInteractions = false;

        console.log('Visual constructor', options);
        this.formattingSettingsService = new FormattingSettingsService();
        this.target = options.element;

        if (document) {
            const img: HTMLImageElement = document.createElement("img");
            const alt: HTMLDivElement = document.createElement("div");

            img.alt = "";

            alt.style.display = "none";
            alt.appendChild(document.createElement("p"));

            this.imgElement = img;
            this.altElement = alt;

            this.target.appendChild(this.imgElement);
            this.target.appendChild(this.altElement);
            this.target.classList.add("simple-image-container");
        }

        this.events = options.host.eventService;
    }

    private scaleImage(scalingMode: ScalingMode): void {
        switch (scalingMode) {
            case ScalingMode.Normal:
                const imgRatio: number = Math.min(this.target.clientWidth / this.imgElement.naturalWidth, 
                    this.target.clientHeight / this.imgElement.naturalHeight);
    
                this.imgElement.width = this.imgElement.naturalWidth * imgRatio;
                this.imgElement.height = this.imgElement.naturalHeight * imgRatio;

                break;
            case ScalingMode.Fit:
                this.imgElement.height = this.target.clientHeight;
                this.imgElement.width = this.target.clientWidth;

                break;
            case ScalingMode.None:
                this.imgElement.width = this.imgElement.naturalWidth;
                this.imgElement.height = this.imgElement.naturalHeight;

                break;
            default:
                break;
        } 
    }

    private alignImage(imageAlignment: ImageAlignment): void {
        this.imgElement.style.margin = "0";
        this.imgElement.style.float = "none";

        if (imageAlignment.endsWith("center")) {
            this.imgElement.style.margin = "0 auto";
        }
        else if (imageAlignment.endsWith("right")) {
            this.imgElement.style.float = "right";
        }

        if (imageAlignment.startsWith("m")) {
            this.imgElement.style.marginTop = (this.target.clientHeight / 2 - (this.imgElement.height / 2)).toString() + "px";
        }
        else if (imageAlignment.startsWith("b")) {
            this.imgElement.style.marginTop = (this.target.clientHeight - this.imgElement.height).toString() + "px";
        }
    }

    private alignAltText(verticalAlignment: VerticalAlignment): void {
        switch (verticalAlignment) {
            case VerticalAlignment.Top:
                this.altElement.style.paddingTop = "0";
                break;
            case VerticalAlignment.Middle:
                this.altElement.style.paddingTop = (this.target.clientHeight / 2 - (this.altElement.firstElementChild.clientHeight / 2)).toString() +  "px";
                break;
            case VerticalAlignment.Bottom:
                this.altElement.style.paddingTop = (this.target.clientHeight - this.altElement.firstElementChild.clientHeight).toString() +  "px";
                break;
            default:
                break;
        }
    }

    private formatAltText(): void {
        this.altElement.style.fontFamily = this.formattingSettings.altTextSettingsCard.fontControl.fontFamily.value;
        this.altElement.style.fontSize = this.formattingSettings.altTextSettingsCard.fontControl.fontSize.value + "px";
        this.altElement.style.fontWeight = this.formattingSettings.altTextSettingsCard.fontControl.bold.value ? "bold" : "normal";
        this.altElement.style.fontStyle = this.formattingSettings.altTextSettingsCard.fontControl.italic.value ? "italic" : "normal";
        this.altElement.style.textDecoration = this.formattingSettings.altTextSettingsCard.fontControl.underline.value ? "underline" : "none";
        this.altElement.style.color = this.formattingSettings.altTextSettingsCard.fontColor.value.value;
        this.altElement.style.textAlign = this.formattingSettings.altTextSettingsCard.textHorizontalAlign.value;
    }

    public update(options: VisualUpdateOptions) {
        this.events.renderingStarted(options)

        let imageURL: string | null = options.dataViews[0].categorical?.values[0]?.values[0].toString();
        let altText: string | null = options.dataViews[0].categorical?.values[1]?.values[0].toString();

        if (!imageURL) {
            return;
        }
        this.imgElement.src = imageURL;

        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, options.dataViews[0]);

        this.imgElement.onload = () => {
            this.altElement.style.display = "none";
            this.imgElement.style.display = "block";

            const scalingMode = this.formattingSettings.imageSettingsCard.scalingMode.value as ScalingMode;
            this.scaleImage(scalingMode as ScalingMode);
            this.alignImage(this.formattingSettings.imageSettingsCard.imageAlignment.value as ImageAlignment);

            this.events.renderingFinished(options);
        }

        this.imgElement.onerror = () => {
            this.imgElement.style.display = "none";

            if (altText && this.formattingSettings.altTextSettingsCard.showAltText.value) {
                this.altElement.firstChild.textContent = altText;
                this.altElement.style.display = "block";

                this.formatAltText();
                this.alignAltText(this.formattingSettings.altTextSettingsCard.textVerticalAlign.value as VerticalAlignment);
            }
            else {
                this.altElement.style.display = "none";
            }

            this.events.renderingFinished(options);
        }
    }

    /**
     * Returns properties pane formatting model content hierarchies, properties and latest formatting values, Then populate properties pane.
     * This method is called once every time we open properties pane or when the user edit any format property. 
     */
    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}