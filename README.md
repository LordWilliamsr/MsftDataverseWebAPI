# MsftDataverseWebAPI
Use the Microsoft Dataverse web API in a Power Apps component


Use the Microsoft Dataverse web API in a Power Apps component
20 minutes
A common scenario during component development is the requirement to interface with data in your solution's underlying Microsoft Dataverse. The Power Apps component framework exposes a Web API feature to achieve this requirement. This example will illustrate how to perform various CRUD operations by using this feature.

# Initialize your component's project
To initialize your component's project, follow these steps:

Initialize the project by running the following command:

Azure PowerShell

Copy
pac pcf init --namespace SampleNamespace --name TSWebAPI --template field
Run npm install to load dependent libraries into your project.

# Implement your code component's logic
To implement your code component's logic, follow these steps:

Open your code component's manifest file (ControlManifest.Input.xml) and replace it with the following logic:

XML

Copy
<?xml version="1.0" encoding="utf-8"?>
<manifest>
    <control namespace="SampleNamespace" constructor="TSWebAPI" version="1.0.0" display-name-key="TS_WebAPI_Display_Key" description-key="TS_WebAPI_Desc_Display_Key" control-type="standard">
        <property name="stringProperty" display-name-key="stringProperty_Display_Key" description-key="stringProperty_Desc_Key" of-type="SingleLine.Text" usage="bound" required="true" />
        <resources>
            <code path="index.ts" order="1" />
            <css path="css/TS_WebAPI.css" order="2" />
        </resources>
        <feature-usage>
            <uses-feature name="WebAPI" required="true" />
        </feature-usage>
    </control>
</manifest>
You'll be adding the supporting files that are found in this manifest later.

Open the index.ts file.

Above the constructor method, insert the following private variables to support rendering of your component:

C#

Copy
    // Reference to the control container HTMLDivElement
    // This element contains all elements of our custom control example
    private _container: HTMLDivElement;

    // Reference to ComponentFramework Context object
    private _context: ComponentFramework.Context<IInputs>;

    // Flag if control view has been rendered
    private _controlViewRendered: Boolean;

    // References to button elements that are rendered by example custom control
    private _createEntity1Button: HTMLButtonElement;
    private _createEntity2Button: HTMLButtonElement;
    private _createEntity3Button: HTMLButtonElement;
    private _deleteRecordButton: HTMLButtonElement;
    private _fetchXmlRefreshButton: HTMLButtonElement;
    private _oDataRefreshButton: HTMLButtonElement;

    // References to div elements that are rendered by the example custom control
    private _odataStatusContainerDiv: HTMLDivElement;
    private _resultContainerDiv: HTMLDivElement;
Add the following private static variables above the constructor to indicate which entity/fields you will be interfacing with in this example. If you want to try against different entities or fields, you can do so by changing their respective values.

C#

Copy
    // Name of entity to use for example Web API calls that are performed by this control
    private static _entityName: string = "account";

    // Required field on _entityName of type 'single line of text'
    // Example Web API calls that are performed by the example custom control will set this field for new record creation examples
    private static _requiredAttributeName: string = "name";

    // Value that the _requiredAttributeName field will be set to for new created records
    private static _requiredAttributeValue: string = "Web API Custom Control (Sample)";

    // Name of currency field on _entityName to populate during record create
    // Example Web API calls that are performed by the example custom control will set and read this field
    private static _currencyAttributeName: string = "revenue";

    // Friendly name of currency field (only used for control UI - no functional impact)
    private static _currencyAttributeNameFriendlyName: string = "annual revenue";
Place the following logic inside of the init method:

C#

Copy
        this._context = context;
        this._controlViewRendered = false;
        this._container = document.createElement("div");
        this._container.classList.add("TSWebAPI_Container");
        container.appendChild(this._container);
Add the following logic to the updateView method:

C#

Copy
if (!this._controlViewRendered) {
            this._controlViewRendered = true;

            // Render Web API Examples
            this.renderCreateExample();
            this.renderDeleteExample();
            this.renderFetchXmlRetrieveMultipleExample();
            this.renderODataRetrieveMultipleExample();

            // Render result div to display output of Web API calls
            this.renderResultsDiv();
Add the following helper methods to render the HTML elements in your component:

C#

Copy
/**
     * Helper method to create HTML button that is used for CreateRecord Web API Example
     * @param buttonLabel : Label for button
     * @param buttonId : ID for button
     * @param buttonValue : Value of button (attribute of button)
     * @param onClickHandler : onClick event handler to invoke for the button
     */
    private createHTMLButtonElement(buttonLabel: string, buttonId: string, buttonValue: string | null, onClickHandler: (event?: any) => void): HTMLButtonElement {
        let button: HTMLButtonElement = document.createElement("button");
        button.innerHTML = buttonLabel;

        if (buttonValue) {
            button.setAttribute("buttonvalue", buttonValue);
        }

        button.id = buttonId;

        button.classList.add("SampleControl_WebAPI_ButtonClass");
        button.addEventListener("click", onClickHandler);
        return button;
    }

    /**
     * Helper method to create HTML Div Element
     * @param elementClassName : Class name of div element
     * @param isHeader : True if 'header' div - adds extra class and post-fix to ID for header elements
     * @param innerText : innerText of Div Element
     */
    private createHTMLDivElement(elementClassName: string, isHeader: Boolean, innerText?: string): HTMLDivElement {
        let div: HTMLDivElement = document.createElement("div");

        if (isHeader) {
            div.classList.add("SampleControl_WebAPI_Header");
            elementClassName += "_header";
        }

        if (innerText) {
            div.innerText = innerText.toUpperCase();
        }

        div.classList.add(elementClassName);
        return div;
    }

    /** 
     * Renders a 'result container' div element to inject the status of the example Web API calls 
     */
    private renderResultsDiv() {
        // Render header label for result container
        let resultDivHeader: HTMLDivElement = this.createHTMLDivElement("result_container", true,
            "Result of last action");
        this._container.appendChild(resultDivHeader);

        // Div elements to populate with the result text
        this._resultContainerDiv = this.createHTMLDivElement("result_container", false, undefined);
        this._container.appendChild(this._resultContainerDiv);

        // Init the result container with a notification that the control was loaded
        this.updateResultContainerText("Web API sample custom control loaded");
    }

    /**
     * Helper method to inject HTML into result container div
     * @param statusHTML : HTML to inject into result container
     */
    private updateResultContainerText(statusHTML: string): void {
        if (this._resultContainerDiv) {
            this._resultContainerDiv.innerHTML = statusHTML;
        }
    }

    /**
     * Helper method to inject error string into result container div after failed Web API call
     * @param errorResponse : error object from rejected promise
     */
    private updateResultContainerTextWithErrorResponse(errorResponse: any): void {
        if (this._resultContainerDiv) {
            // Retrieve the error message from the errorResponse and inject into the result div
            let errorHTML: string = "Error with Web API call:";
            errorHTML += "<br />"
            errorHTML += errorResponse.message;
            this._resultContainerDiv.innerHTML = errorHTML;
        }
    }

    /**
     * Helper method to generate Label for Create Buttons
     * @param entityNumber : value to set _currencyAttributeNameFriendlyName field to for this button
     */
    private getCreateRecordButtonLabel(entityNumber: string): string {
        return "Create record with " + TSWebAPI._currencyAttributeNameFriendlyName + " of " + entityNumber;
    }

    /**
     * Helper method to generate ID for Create button
     * @param entityNumber : value to set _currencyAttributeNameFriendlyName field to for this button
     */
    private getCreateButtonId(entityNumber: string): string {
        return "create_button_" + entityNumber;
    }
Add the following onClick event handlers to trigger the various CRUD operations:

C#

Copy
/**
     * Event Handler for onClick of create record button
     * @param event : click event
     */
    private createButtonOnClickHandler(event: Event): void {
        // Retrieve the value to set the currency field to from the button's attribute
        let currencyAttributeValue: Number = parseInt(
            (event.srcElement! as Element)!.attributes.getNamedItem("buttonvalue")!.value
        );

        // Generate unique record name by appending timestamp to _requiredAttributeValue
        let recordName: string = TSWebAPI._requiredAttributeValue + "_" + Date.now();

        // Set the values for the attributes we want to set on the new record
        // If you want to set additional attributes on the new record, add to data dictionary as key/value pair
        var data: any = {};
        data[TSWebAPI._requiredAttributeName] = recordName;
        data[TSWebAPI._currencyAttributeName] = currencyAttributeValue;

        // store reference to 'this' so it can be used in the callback method
        var thisRef = this;

        // Invoke the Web API to creat the new record
        this._context.webAPI.createRecord(TSWebAPI._entityName, data).then
            (
                function (response: ComponentFramework.EntityReference) {
                    // Callback method for successful creation of new record

                    // Get the ID of the new record created
                    let id: string = response.id.guid;

                    // Generate HTML to inject into the result div to showcase the fields and values of the new record that is created
                    let resultHtml: string = "Created new " + TSWebAPI._entityName + " record with below values:"
                    resultHtml += "<br />";
                    resultHtml += "<br />";
                    resultHtml += "id: " + id;
                    resultHtml += "<br />";
                    resultHtml += "<br />";
                    resultHtml += TSWebAPI._requiredAttributeName + ": " + recordName;
                    resultHtml += "<br />";
                    resultHtml += "<br />";
                    resultHtml += TSWebAPI._currencyAttributeName + ": " + currencyAttributeValue;

                    thisRef.updateResultContainerText(resultHtml);
                },
                function (errorResponse: any) {
                    // Error handling code here - record failed to be created
                    thisRef.updateResultContainerTextWithErrorResponse(errorResponse);
                }
            );
    }

    /**
     * Event Handler for onClick of delete record button
     * @param event : click event
     */
    private deleteButtonOnClickHandler(): void {
        // Invoke a lookup dialog to allow the user to select an existing record of type _entityName to delete
        var lookUpOptions: any =
        {
            entityTypes: [TSWebAPI._entityName]
        };

        // store reference to 'this' so it can be used in the callback method
        var thisRef = this;

        var lookUpPromise: any = this._context.utils.lookupObjects(lookUpOptions);

        lookUpPromise.then
            (
                // Callback method - invoked after user has selected an item from the lookup dialog
                // Data parameter is the item selected in the lookup dialog
                (data: ComponentFramework.EntityReference[]) => {
                    if (data && data[0]) {
                        // Get the ID and entityType of the record that was selected by the lookup
                        let id: string = data[0].id.guid;
                        let entityType: string = data[0].etn!;

                        // Invoke the deleteRecord method of the WebAPI to delete the selected record
                        this._context.webAPI.deleteRecord(entityType, id).then
                            (
                                function (response: ComponentFramework.EntityReference) {
                                    // Record was deleted successfully
                                    let responseId: string = response.id.guid;
                                    let responseEntityType: string = response.etn!;

                                    // Generate HTML to inject into the result div to showcase the deleted record 
                                    thisRef.updateResultContainerText("Deleted " + responseEntityType + " record with ID: " + responseId);
                                },
                                function (errorResponse: any) {
                                    // Error handling code here
                                    thisRef.updateResultContainerTextWithErrorResponse(errorResponse);
                                }
                            );
                    }
                },
                (error: any) => {
                    // Error handling code here
                    thisRef.updateResultContainerTextWithErrorResponse(error);
                }
            );
    }

    /**
     * Event Handler for onClick of calculate average value button
     * @param event : click event
     */
    private calculateAverageButtonOnClickHandler(): void {
        // Build FetchXML to retrieve the average value of _currencyAttributeName field for all _entityName records
        // Add a filter to only aggregate on records that have _currencyAttributeName not set to null
        let fetchXML: string = "<fetch distinct='false' mapping='logical' aggregate='true'>";
        fetchXML += "<entity name='" + TSWebAPI._entityName + "'>";
        fetchXML += "<attribute name='" + TSWebAPI._currencyAttributeName + "' aggregate='avg' alias='average_val' />";
        fetchXML += "<filter>";
        fetchXML += "<condition attribute='" + TSWebAPI._currencyAttributeName + "' operator='not-null' />";
        fetchXML += "</filter>";
        fetchXML += "</entity>";
        fetchXML += "</fetch>";

        // store reference to 'this' so it can be used in the callback method
        var thisRef = this;

        // Invoke the Web API RetrieveMultipleRecords method to calculate the aggregate value
        this._context.webAPI.retrieveMultipleRecords(TSWebAPI._entityName, "?fetchXml=" + fetchXML).then
            (
                function (response: ComponentFramework.WebApi.RetrieveMultipleResponse) {
                    // Retrieve multiple completed successfully -- retrieve the averageValue 
                    let averageVal: Number = response.entities[0].average_val;

                    // Generate HTML to inject into the result div to showcase the result of the RetrieveMultiple Web API call
                    let resultHTML: string = "Average value of " + TSWebAPI._currencyAttributeNameFriendlyName + " attribute for all " + TSWebAPI._entityName + " records: " + averageVal;
                    thisRef.updateResultContainerText(resultHTML);
                },
                function (errorResponse: any) {
                    // Error handling code here
                    thisRef.updateResultContainerTextWithErrorResponse(errorResponse);
                }
            );
    }

    /**
     * Event Handler for onClick of calculate record count button
     * @param event : click event
     */
    private refreshRecordCountButtonOnClickHandler(): void {
        // Generate OData query string to retrieve the _currencyAttributeName field for all _entityName records
        // Add a filter to only retrieve records with _requiredAttributeName field which contains _requiredAttributeValue
        let queryString: string = "?$select=" + TSWebAPI._currencyAttributeName + "&$filter=contains(" + TSWebAPI._requiredAttributeName +
            ",'" + TSWebAPI._requiredAttributeValue + "')";

        // store reference to 'this' so it can be used in the callback method
        var thisRef = this;

        // Invoke the Web API Retrieve Multiple call
        this._context.webAPI.retrieveMultipleRecords(TSWebAPI._entityName, queryString).then
            (
                function (response: any) {
                    // Retrieve Multiple Web API call completed successfully
                    let count1: number = 0;
                    let count2: number = 0;
                    let count3: number = 0;

                    // Loop through each returned record
                    for (let entity of response.entities) {
                        // Retrieve the value of _currencyAttributeName field
                        let value: Number = entity[TSWebAPI._currencyAttributeName];

                        // Check the value of _currencyAttributeName field and increment the correct counter
                        if (value == 100) {
                            count1++;
                        }
                        else if (value == 200) {
                            count2++;
                        }
                        else if (value == 300) {
                            count3++;
                        }
                    }

                    // Generate HTML to inject into the fetch xml status div to showcase the results of the OData retrieve example
                    let innerHtml: string = "Use above buttons to create or delete a record to see count update";
                    innerHtml += "<br />";
                    innerHtml += "<br />";
                    innerHtml += "Count of " + TSWebAPI._entityName + " records with " + TSWebAPI._currencyAttributeName + " of 100: " + count1;
                    innerHtml += "<br />";
                    innerHtml += "Count of " + TSWebAPI._entityName + " records with " + TSWebAPI._currencyAttributeName + " of 200: " + count2;
                    innerHtml += "<br />";
                    innerHtml += "Count of " + TSWebAPI._entityName + " records with " + TSWebAPI._currencyAttributeName + " of 300: " + count3;

                    // Inject the HTML into the fetch xml status div
                    if (thisRef._odataStatusContainerDiv) {
                        thisRef._odataStatusContainerDiv.innerHTML = innerHtml;
                    }

                    // Inject a success message into the result div
                    thisRef.updateResultContainerText("Record count refreshed");
                },
                function (errorResponse: any) {
                    // Error handling code here
                    thisRef.updateResultContainerTextWithErrorResponse(errorResponse);
                }
            );
    }
Add the following helper methods to render the results of your CRUD operations within your component:

C#

Copy
     /** 
     * Renders example use of CreateRecord Web API
     */
    private renderCreateExample() {
        // Create header label for Web API sample
        let headerDiv: HTMLDivElement = this.createHTMLDivElement("create_container", true, "Click to create "
            + TSWebAPI._entityName + " record");
        this._container.appendChild(headerDiv);

        // Create button 1 to create a record with the revenue field set to 100
        let value1: string = "100";
        this._createEntity1Button = this.createHTMLButtonElement(
            this.getCreateRecordButtonLabel(value1),
            this.getCreateButtonId(value1),
            value1,
            this.createButtonOnClickHandler.bind(this));

        // Create button 2 to create a record with the revenue field set to 200
        let value2: string = "200";
        this._createEntity2Button = this.createHTMLButtonElement(
            this.getCreateRecordButtonLabel(value2),
            this.getCreateButtonId(value2),
            value2,
            this.createButtonOnClickHandler.bind(this));

        // Create button 3 to create a record with the revenue field set to 300
        let value3: string = "300";
        this._createEntity3Button = this.createHTMLButtonElement(
            this.getCreateRecordButtonLabel(value3),
            this.getCreateButtonId(value3),
            value3,
            this.createButtonOnClickHandler.bind(this));

        // Append all button HTML elements to custom control container div
        this._container.appendChild(this._createEntity1Button);
        this._container.appendChild(this._createEntity2Button);
        this._container.appendChild(this._createEntity3Button);
    }

    /** 
     * Renders example use of DeleteRecord Web API
     */
    private renderDeleteExample(): void {
        // Create header label for Web API sample
        let headerDiv: HTMLDivElement = this.createHTMLDivElement("delete_container", true, "Click to delete " + TSWebAPI._entityName + " record");

        // Render button to invoke DeleteRecord Web API call
        this._deleteRecordButton = this.createHTMLButtonElement(
            "Select record to delete",
            "delete_button",
            null,
            this.deleteButtonOnClickHandler.bind(this));

        // Append elements to custom control container div
        this._container.appendChild(headerDiv);
        this._container.appendChild(this._deleteRecordButton);
    }

    /** 
     * Renders example use of RetrieveMultiple Web API with OData
     */
    private renderODataRetrieveMultipleExample(): void {
        let containerClassName: string = "odata_status_container";

        // Create header label for Web API sample
        let statusDivHeader: HTMLDivElement = this.createHTMLDivElement(containerClassName, true, "Click to refresh record count");
        this._odataStatusContainerDiv = this.createHTMLDivElement(containerClassName, false, undefined);

        // Create button to invoke OData RetrieveMultiple Example
        this._fetchXmlRefreshButton = this.createHTMLButtonElement(
            "Refresh record count",
            "odata_refresh",
            null,
            this.refreshRecordCountButtonOnClickHandler.bind(this));

        // Append HTML elements to custom control container div
        this._container.appendChild(statusDivHeader);
        this._container.appendChild(this._odataStatusContainerDiv);
        this._container.appendChild(this._fetchXmlRefreshButton);
    }

    /** 
     * Renders example use of RetrieveMultiple Web API with Fetch XML
     */
    private renderFetchXmlRetrieveMultipleExample(): void {
        let containerName: string = "fetchxml_status_container";

        // Create header label for Web API sample
        let statusDivHeader: HTMLDivElement = this.createHTMLDivElement(containerName, true,
            "Click to calculate average value of " + TSWebAPI._currencyAttributeNameFriendlyName);
        let statusDiv: HTMLDivElement = this.createHTMLDivElement(containerName, false, undefined);

        // Create button to invoke Fetch XML RetrieveMultiple Web API example
        this._oDataRefreshButton = this.createHTMLButtonElement(
            "Calculate average value of " + TSWebAPI._currencyAttributeNameFriendlyName,
            "odata_refresh",
            null,
            this.calculateAverageButtonOnClickHandler.bind(this));

        // Append HTML Elements to custom control container div
        this._container.appendChild(statusDivHeader);
        this._container.appendChild(statusDiv);
        this._container.appendChild(this._oDataRefreshButton);
    }
After you've made the updates, your completed class should look similar to the following example:

C#

Copy
This file is part of the Microsoft Power Apps code samples. 
    Copyright (C) Microsoft Corporation. All rights reserved. 
    This source code is intended only as a supplement to Microsoft Development Tools and/or  
    online documentation. See these other materials for detailed information regarding  
    Microsoft code samples. 

    THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER  
    EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF  
    MERCHANTABILITY AND/OR FITNESS FOR A PARTICULAR PURPOSE. 
 */

import {IInputs, IOutputs} from "./generated/ManifestTypes";

    export class FormattingAPI implements ComponentFramework.StandardControl<IInputs, IOutputs> {

        // PCF framework delegate that will be assigned to this object that would be called whenever any update happens. 
        private _notifyOutputChanged: () => void;

        // Reference to the div element that holds together all the HTML elements that we are creating as part of this control
        private divElement: HTMLDivElement;

        // Reference to HTMLTableElement that is rendered by the control
        private _tableElement: HTMLTableElement;

        // Reference to the control container HTMLDivElement
        // This element contains all elements of our custom control example
        private _container: HTMLDivElement;

        // Reference to ComponentFramework Context object
        private _context: ComponentFramework.Context<IInputs>;

        // Flag if control view has been rendered
        private _controlViewRendered: Boolean;

        /**
         * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
         * Dataset values are not initialized here, use updateView.
         * @param context The entire property bag that is available to control through the Context Object; It contains values as set up by the customizer that are mapped to property names that are defined in the manifest and to utility functions.
         * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
         * @param state A piece of data that persists in one session for a single user. Can be set at any point in a control's life cycle by calling 'setControlState' in the Mode interface.
         * @param container If a control is marked control-type='starndard', it will receive an empty div element within which it can render its content.
         */
        public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
        {
            this._notifyOutputChanged = notifyOutputChanged;
            this._controlViewRendered = false;
            this._context = context;

            this._container = document.createElement("div");
            this._container.classList.add("TSFormatting_Container");
            container.appendChild(this._container);
        }

            /**
         * Called when any value in the property bag has changed. This includes field values, datasets, global values such as container height and width, offline status, control metadata values such as label, visible, and so on.
         * @param context The entire property bag that is available to control through the Context Object; It contains values as set up by the customizer that are mapped to names that are defined in the manifest and to utility functions.
         */
        public updateView(context: ComponentFramework.Context<IInputs>): void
        {
            if (!this._controlViewRendered)
            {
                // Render and add HTMLTable to the custom control container element
                let tableElement: HTMLTableElement = this.createHTMLTableElement();
                this._container.appendChild(tableElement);

                this._controlViewRendered = true;
            }
        }

        /** 
         * It is called by the framework prior to a control receiving new data. 
         * @returns an object based on nomenclature that is defined in manifest, except object[s] for property that are marked as "bound" or "output"
         */
        public getOutputs(): IOutputs
        {
            // no-op: method not used by this example custom control
            return { };
        }

        /** 
         * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup,
         * such as canceling any pending remote calls, removing listeners, and so on.
         */
        public destroy()
        {

        }

        /**
         * Helper method to create an HTML Table Row Element
         * @param key : string value to show in left column cell
         * @param value : string value to show in right column cell
         * @param isHeaderRow : true if method should generate a header row
         */
        private createHTMLTableRowElement(key: string, value: string, isHeaderRow: Boolean): HTMLTableRowElement
        {
            let keyCell: HTMLTableCellElement = this.createHTMLTableCellElement(key, "FormattingControlSampleHtmlTable_HtmlCell_Key", isHeaderRow);
            let valueCell: HTMLTableCellElement = this.createHTMLTableCellElement(value, "FormattingControlSampleHtmlTable_HtmlCell_Value", isHeaderRow);

            let rowElement: HTMLTableRowElement = document.createElement("tr");
            rowElement.setAttribute("class", "FormattingControlSampleHtmlTable_HtmlRow");
            rowElement.appendChild(keyCell);
            rowElement.appendChild(valueCell);

            return rowElement;
        }

        /**
         * Helper method to create an HTML Table Cell Element
         * @param cellValue : string value to inject in the cell
         * @param className : class name for the cell
         * @param isHeaderRow : true if method should generate a header row cell
         */
        private createHTMLTableCellElement(cellValue: string, className: string, isHeaderRow: Boolean): HTMLTableCellElement
        {
            let cellElement: HTMLTableCellElement;

            if (isHeaderRow)
            {
                cellElement = document.createElement("th");
                cellElement.setAttribute("class", "FormattingControlSampleHtmlTable_HtmlHeaderCell " + className);
                let textElement: Text = document.createTextNode(cellValue);
                cellElement.appendChild(textElement);
            }
            else
            {
                cellElement = document.createElement("td");
                cellElement.setAttribute("class", "FormattingControlSampleHtmlTable_HtmlCell " + className);
                let textElement: Text = document.createTextNode(cellValue);
                cellElement.appendChild(textElement);
            }
            return cellElement;
        }

        /** 
        * Creates an HTML Table that showcases examples of basic methods that are available to the custom control
        * The left column of the table shows the method name or property that is being used
        * The right column of the table shows the result of that method name or property
        */
        private createHTMLTableElement(): HTMLTableElement
        {
            // Create HTML Table Element
            let tableElement: HTMLTableElement = document.createElement("table");
            tableElement.setAttribute("class", "FormattingControlSampleHtmlTable_HtmlTable");

            // Create header row for table
            let key: string = "Example Method";
            let value: string = "Result";
            tableElement.appendChild(this.createHTMLTableRowElement(key, value, true));

            // Example use of formatCurrency() method 
            // Change the default currency and the precision or pass in the precision and currency as additional parameters.
            key = "formatCurrency()";
            value = this._context.formatting.formatCurrency(10250030);
            tableElement.appendChild(this.createHTMLTableRowElement(key, value, false));

            // Example use of formatDecimal() method 
            // Change the settings from user settings to see the output change its format accordingly
            key = "formatDecimal()";
            value = this._context.formatting.formatDecimal(123456.2782);
            tableElement.appendChild(this.createHTMLTableRowElement(key, value, false));

            // Example use of formatInteger() method
            // Change the settings from user settings to see the output change its format accordingly.
            key = "formatInteger()";
            value = this._context.formatting.formatInteger(12345);
            tableElement.appendChild(this.createHTMLTableRowElement(key, value, false));

            // Example use of formatLanguage() method
            // Install additional languages and pass in the corresponding language code to see its string value
            key = "formatLanguage()";
            value = this._context.formatting.formatLanguage(1033);
            tableElement.appendChild(this.createHTMLTableRowElement(key, value, false));

            // Example of formatDateYearMonth() method
            // Pass a JavaScript Data object set to the current time into formatDateYearMonth method to format the data
            // and get the return in Year, Month format
            key = "formatDateYearMonth()";
            value = this._context.formatting.formatDateYearMonth(new Date());
            tableElement.appendChild(this.createHTMLTableRowElement(key, value, false));

            // Example of getWeekOfYear() method
            // Pass a JavaScript Data object set to the current time into getWeekOfYear method to get the value for week of the year
            key = "getWeekOfYear()";
            value = this._context.formatting.getWeekOfYear(new Date()).toString();
            tableElement.appendChild(this.createHTMLTableRowElement(key, value, false));

            return tableElement;
        }

    }
If you want to view a completed version of this file, you can find one in the solution files of this module.

Add styling to your code component
To add styling to your code component, follow these steps:

Create a new CSS subfolder under the TSWebAPI folder.

Create a new TS_WebAPI.css file inside the CSS subfolder.

Add the following style content to the TS_WebAPI.css file:

XML

Copy
/*
    This file is part of the Microsoft Power Apps code samples. 
    Copyright (C) Microsoft Corporation. All rights reserved. 
    This source code is intended only as a supplement to Microsoft Development Tools and/or  
    online documentation. See these other materials for detailed information regarding  
    Microsoft code samples. 

    THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER  
    EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF  
    MERCHANTABILITY AND/OR FITNESS FOR A PARTICULAR PURPOSE. 
 */
.SampleNamespace\.TSWebAPI
{
    font-family: 'SegoeUI-Semibold', 'Segoe UI Semibold', 'Segoe UI Regular', 'Segoe UI';
    color: #1160B7;
}

.SampleNamespace\.TSWebAPI .TSWebAPI_Container
{
    overflow-x: auto;
}

.SampleNamespace\.TSWebAPI .SampleControl_WebAPI_Header
{
    color: rgb(51, 51, 51);
    font-size: 1rem;
    padding-top: 20px;
}

.SampleNamespace\.TSWebAPI .result_container
{
    padding-bottom: 20px;
}

.SampleNamespace\.TSWebAPI .SampleControl_WebAPI_ButtonClass
{
    text-decoration: none;
    display: inline-block;
    font-size: 14px;
    cursor: pointer;
    color: #1160B7;
    background-color: #FFFFFF;
    border: 1px solid black;
    padding: 5px;
    text-align: center;
    min-width: 300px;
    margin-top: 10px;
    margin-bottom: 5px;
    display: block;
}
Save the TS_WebAPI.css file:

Build and run your component
To build and run your component, follow these steps:

Build your solution by running npm run build.

Upon successful build, you can test your new formatting API component by running npm start. To test the web API functionality, you will need to publish and host the component in a live Power Apps environment. For more details on how to publish Power Apps components, see "Package a code component" in the Write a custom Power Apps component module.

