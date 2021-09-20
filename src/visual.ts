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

module powerbi.extensibility.visual {
    "use strict";
    export class Visual implements IVisual {
        private target: HTMLElement;
        private altTextElement: HTMLParagraphElement;
        private imgElement: HTMLImageElement;
        private settings: VisualSettings;

        constructor(options: VisualConstructorOptions) {
            this.target = options.element;

            if (typeof document !== "undefined") {
                this.imgElement = document.createElement("img");
                this.altTextElement = document.createElement("p");

                this.target.appendChild(this.imgElement);
                this.target.appendChild(this.altTextElement);
            }
        }

        public update(options: VisualUpdateOptions) {
            let isLoaded: boolean = true;
            let imageURL: string | null = null;
            let altText: string = "";

            this.imgElement.src = "";

            if (options.dataViews[0].tree.root.children[0].values[0].value) {
                imageURL = options.dataViews[0].tree.root.children[0].values[0].value.toString();
            }

            this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);

            /* Check if the Alt Text value was provided. */
            if (options.dataViews[0].tree.root.children[0].values[1]) {
                altText = options.dataViews[0].tree.root.children[0].values[1].value.toString();
            }

            this.imgElement.onload = () => {
                this.imgElement.style.visibility = "visible";
                this.altTextElement.style.visibility = "hidden";

                this.update(options);
            }

            this.imgElement.onerror = () => {
                this.imgElement.style.visibility = "hidden";

                this.altTextElement.style.visibility = this.settings.altTextSettings.show ? "visible" : "hidden";
            }

            this.imgElement.src = imageURL;
            this.imgElement.alt = altText;

            this.altTextElement.innerText = altText;

            switch (this.settings.imageSettings.scalingMode) {
                case "normal": {
                    const imgRatio: number = Math.min(this.target.clientWidth / this.imgElement.naturalWidth, 
                        this.target.clientHeight / this.imgElement.naturalHeight);
        
                    this.imgElement.width = this.imgElement.naturalWidth * imgRatio;
                    this.imgElement.height = this.imgElement.naturalHeight * imgRatio;

                    break;
                }
                case "fit": {
                    this.imgElement.height = this.target.clientHeight;
                    this.imgElement.width = this.target.clientWidth;
                    break;
                }
                case "none": {
                    this.imgElement.width = this.imgElement.naturalWidth;
                    this.imgElement.height = this.imgElement.naturalHeight;                    

                    break;
                }
            }

            switch (this.settings.imageSettings.imageAlignment) {
                case "left": {
                    this.imgElement.className = "";
                    break;
                }
                case "center": {
                    this.imgElement.className = "alignCenter";
                    break;
                }
                case "right": {
                    this.imgElement.className = "alignRight";
                    break;
                }
                case "mleft": {
                    this.imgElement.className = "alignMiddleLeft";
                    break;
                }
                case "mcenter": {
                    this.imgElement.className = "alignMiddleCenter";
                    break;
                }
                case "mright": {
                    this.imgElement.className = "alignMiddleRight";
                    break;
                }
            }

            /* Styling of the image element. */
            this.altTextElement.style.fontFamily = this.settings.altTextSettings.fontFamily;
            this.altTextElement.style.fontSize = this.settings.altTextSettings.fontSize.toString() + "px";
            this.altTextElement.style.color = this.settings.altTextSettings.fontColor;
            this.altTextElement.style.backgroundColor = this.settings.altTextSettings.backgroundColor;
            this.altTextElement.style.textAlign = this.settings.altTextSettings.textAlign;
        }

        private static parseSettings(dataView: DataView): VisualSettings {
            return VisualSettings.parse(dataView) as VisualSettings;
        }

        /** 
         * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the 
         * objects and properties you want to expose to the users in the property pane.
         * 
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
            return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
        }
    }
}
