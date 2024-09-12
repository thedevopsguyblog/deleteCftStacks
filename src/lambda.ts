import { CloudFormationClient, DeleteStackCommand, ListStacksCommand } from "@aws-sdk/client-cloudformation";
import type { ListStacksCommandInput, StackSummary } from "@aws-sdk/client-cloudformation";

const client = new CloudFormationClient({});
const input:ListStacksCommandInput = {
    StackStatusFilter: [
        "CREATE_COMPLETE",
        "CREATE_FAILED",
        "CREATE_IN_PROGRESS",
        "IMPORT_COMPLETE",
        "IMPORT_IN_PROGRESS",
        "IMPORT_ROLLBACK_COMPLETE",
        "IMPORT_ROLLBACK_FAILED",
        "IMPORT_ROLLBACK_IN_PROGRESS",
        "REVIEW_IN_PROGRESS",
        "ROLLBACK_COMPLETE",
        "ROLLBACK_FAILED",
        "ROLLBACK_IN_PROGRESS",
        "UPDATE_COMPLETE",
        "UPDATE_COMPLETE_CLEANUP_IN_PROGRESS",
        "UPDATE_FAILED",
        "UPDATE_IN_PROGRESS",
        "UPDATE_ROLLBACK_COMPLETE",
        "UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS",
        "UPDATE_ROLLBACK_FAILED",
        "UPDATE_ROLLBACK_IN_PROGRESS",
    ]
};

/**
 * Get all stacks that match the regex pattern
 * @description Any stack starting with D or T and having 2 to 4 characters, then a hyphen will be deleted.
 * @returns an array of StackSummary objects
 * 
 */
export async function getStacks(){
    const regex = /^(D|T)[a-zA-Z]{2,4}.*-.*/ 
    try {
        const command = new ListStacksCommand(input);
        const response = await client.send(command);
        const filteredStacks = response.StackSummaries!.filter(s => regex.test(s.StackName!));
        console.debug('All Stacks:', response.StackSummaries!.length, 'Filtered Stacks:', filteredStacks.length);
        return filteredStacks;
    }
    catch (err) {
        console.error('\nError in running getStacks():\n',err);
        return [];
    }

}

export async function deleteStack(stack: StackSummary){
    console.debug('Deleting:', stack.StackName);
    // const command = new DeleteStackCommand({ 
    //     StackName: stack.StackName!,
    //     DeletionMode: stack.StackStatus === 'DELETE_FAILED' ? 'FORCE_DELETE_STACK' : 'STANDARD'
    // });
    // const response = await client.send(command);
    // console.debug('Response:', response);
    return false;
}

/**
 * @description Retry deletion for failed stacks
 * @param stacks an array of StackSummary objects
 */
export async function retryDeletion(stacks:StackSummary[]){
    const failedStacks = stacks.filter(s => s.StackStatus === 'DELETE_FAILED' || 'CREATE_COMPLETE');
    console.debug('Retry Stacks:', stacks.length, 'Filtered Stacks:', failedStacks.length);
    
    for (const s of failedStacks) {
        let count = 0;
        while (count < 3) {
            try {
                await deleteStack(s);
                console.info(`Successfully deleted ${s.StackName} on attempt ${count + 1}`);
                break; // Exit the loop if the deletion is successful
            } catch (error) {
                console.error(`Failed to delete ${s.StackName} on attempt ${count + 1}:`, error);
                count++;
                if (count < 3) {
                    await delay((count + 1) * 3000); // Delay before the next attempt
                } else {
                    console.error(`Failed to delete ${s.StackName} after 3 attempts`);
                }
            }
        }
    }


}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const handler = async () => {
    console.log('Begin deletion process');    
    const filteredStacks:StackSummary[] = [];
    const stacks = await getStacks();
    if (stacks.length === 0) {
        console.log('No stacks to delete');
        return;
    }
    try {
        for (const s of stacks || []) {
            filteredStacks.push(s);
            await deleteStack(s);
        }
    } catch(error) {
        console.error('Error:', error);
    }

    // Get a new list of stacks and retry deletion for failed stacks
    await retryDeletion(await getStacks());
}

handler();