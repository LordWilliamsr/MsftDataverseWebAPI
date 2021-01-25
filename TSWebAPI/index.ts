import {IInputs, IOutputs} from "./generated/ManifestTypes";

export class TSWebAPI implements ComponentFramework.StandardControl<IInputs, IOutputs> {
	// Above the constructor method, insert the following private variables to support rendering of your component:
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
	
	/*
		Add the following private static variables above the constructor to indicate which entity/fields you will be interfacing
		with in this example. If you want to try against different entities or fields, you can do so by changing their respective values.
	*/
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


	/**
	 * Empty constructor.
	 */
	constructor()
	{

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
		// Add control initialization code
		this._context = context;
        this._controlViewRendered = false;
        this._container = document.createElement("div");
        this._container.classList.add("TSWebAPI_Container");
        container.appendChild(this._container);
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		// Add code to update control view
		if (!this._controlViewRendered) {
            this._controlViewRendered = true;

            // Render Web API Examples
            this.renderCreateExample();
            this.renderDeleteExample();
            this.renderFetchXmlRetrieveMultipleExample();
            this.renderODataRetrieveMultipleExample();

            // Render result div to display output of Web API calls
            this.renderResultsDiv();
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
	}


	// HELPER METHOD
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
	

	// Add the following onClick event handlers to trigger the various CRUD operations:
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
}