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
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		// Add code to update control view
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
}