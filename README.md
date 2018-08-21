# ODAG Wizard
![Image of Logo](https://github.com/rileymd88/odag_wizard/blob/master/img/logo_grey.png)

A solution which helps with the creation of Qlik ODAG Template apps

Version: 1.0
* Beta release

# Setup Instructions
1. Download the ODAG Wizard from here: https://github.com/rileymd88/odag_wizard.git 
2. Once downloaded. Unzip the folder and place it here on your Qlik Sense Server: ```C:\Program Files\Qlik\Sense\Client``` The folder structure should look like the following: ```C:\Program Files\Qlik\Sense\Client\odag_wizard\...``` (ensure the folder is also named odag_wizard)
3. You will now need to restart the Qlik Sense Server. Alternativly you can also simply restart all Qlik Sense Services.
4. You should now be able to navigate to ```https://<YOUR_QLIK_SENSE_SERVER_HOST_NAME>/resources/odag_wizard/odag_wizard.html``` If prompted to login, login with your Qlik Sense credentials


# Using the ODAG Wizard
1. Create the selection app. This app will normally have one large fact table with aggregated data and a few dimension tables linked to it
![Step_1](../master/img/guide/Step_1.png)

2. Choose the Script editor
![Step_2](../master/img/guide/Step_2.png)

3. Select the data from your main fact table. In this case I am using an SQL database with the ODBC Connector. Since this is a selection app I will not choose fields which contain too much detail
![Step_3a](../master/img/guide/Step_3a.png)
![Step_3b](../master/img/guide/Step_3b.png)
![Step_3c](../master/img/guide/Step_3c.png)

4. Now modify the script in order to group the data correctly and then load the data . I will do this in the SQL part of the script as this will be faster
![Step_4](../master/img/guide/Step_4.png)

5. Now create a new section and add your dimensions. For the dimensions we do not have to do anything besides inserting the script. Once the script has been added click on load data
![Step_5a](../master/img/guide/Step_5a.png)
![Step_5b](../master/img/guide/Step_5b.png)

6. Now navigate to the app overview and create a new sheet with your visualisations
![Step_6](../master/img/guide/Step_6.png)

7. Now navigate to the ODAG Wizard found here: ```https://<YOUR_QLIK_SENSE_SERVER_HOST_NAME>/resources/odag_wizard/odag_wizard.html``` You may be prompted to login during this step. If so, please login with your Qlik Sense credentials
![Step_7a](../master/img/guide/Step_7a.png)
![Step_7b](../master/img/guide/Step_7b.png)

8. From the "Pick Selection Application" dropdown select the app we just created in steps 1-6
![Step_8](../master/img/guide/Step_8.png)

9. Then select the data source you used to create the fact table in the app we just created in steps 1-6. In my case it was an SQL database
![Step_9](../master/img/guide/Step_9.png)

10. Then select the fields which you would like to pass as selections when a user generates a new app from the selection app. You will have the option of passing either only the Selected (green) values, Optional (white) values or Selected or optional values. If the field you have selected is in the format of a date then you should change the Type dropdown from String to Date. You can hit the + and - buttons at the end of the table to add or remove fields. **It is also very important that you choose a field which exists in the fact table created in the selection app**
![Step_10](../master/img/guide/Step_10.png)

11. This click the Create Template App button and then click on the Open App button. Now we will work on adjusting the template app
![Step_11a](../master/img/guide/Step_11a.png)
![Step_11b](../master/img/guide/Step_11b.png)

12. The ODAG wizard has now automatically generated the ODAG Section for us. We can ignore this part of the script for now and focus on the fact section
![Step_12](../master/img/guide/Step_12.png)

13. Within the fact section, we will load the same table as we did in Step_3, however this time we will include all details of the table.
![Step_13a](../master/img/guide/Step_13a.png)
![Step_13b](../master/img/guide/Step_13b.png)
![Step_13c](../master/img/guide/Step_13c.png)

14. Now we will simply add the variable $(WHERE) to my the bottom of the SQL script. In this case I am only using the $(WHERE) variable and not the $(WHERE_DTPART) as well because I did not choose any fields with Type Date in Step_10
![Step_14](../master/img/guide/Step_14.png)

15. Now navigate to the Dimensional Data tab and add the same table(s) that you added in Step_5 
![Step_15a](../master/img/guide/Step_15a.png)
![Step_15b](../master/img/guide/Step_15b.png)

16. Now add a Where Exists function to your table and ensure you save the script. You should use here the key which is linking your dimenson table with your fact table.
![Step_16](../master/img/guide/Step_16.png)

17. Now navigate back to the original app worksheet that we created in Step_6 and click on Edit and from the left panel click on App navigation links and create new. If you do not see the App navigation links on the left panel, you will need to ensure you enable it in the QMC first. It can be enabled in the QMC by navigating to ```https://<YOUR_QLIK_SENSE_SERVER_HOST_NAME>/qmc``` and then On-demand apps service and check the box which says Enable on-demand app service and then click apply
![Step_17](../master/img/guide/Step_17.png)

18. Now we will create our on-demand app navigation link. I will first need to give my link a name, then I need to select the template app we just created. The template will automatically have the same name as our selection app with '_Template' added at the end. For the Expression, I have various options on what parameters need to be fulfilled before allowing an end user to generate a new app. In this example I chose to make it that the user needs to first select 5 customers before being able to generate a new app. More information about this topic can be found here: https://help.qlik.com/en-US/sense/June2018/Subsystems/Hub/Content/LoadData/creating-OnDemand-app.htm. Once you are finsihed click on create and then drag the newly created link to the bottom of the sheet and hit done
![Step_18a](../master/img/guide/Step_18a.png)
![Step_18b](../master/img/guide/Step_18b.png)

19. Now we are ready to test my newly created link. Since we specified that we need to first select 5 or less customers, we need to make this selection before the ODAG link turns green and tells us we can now create the new app. Once the button turns green, click on it and hit generate new app
![Step_19](../master/img/guide/Step_19.gif)
![Step_19a](../master/img/guide/Step_19a.png)
![Step_19a](../master/img/guide/Step_19b.png)

Once the app is finished loading, you can click on the open in new tap icon on the right to open the new app
![Step_19c](../master/img/guide/Step_19c.png)

20. Now we have created an ODAG app! It should contain only the data for the 3 customers we selected


At this point we could be finished, however if we want the end user to have a predefined dashboard and not have to build thier own visualisations, then we need to first design a new dashboard within our newly created ODAG app by creating a new sheet. Once done designing the visualisations, revert back to the original template app we created and copy and paste your visualisations you just created into the template app.
![Step_20a](../master/img/guide/Step_20a.png)
![Step_20b](../master/img/guide/Step_20b.png)
![Step_20c](../master/img/guide/Step_20c.png)

21. Now we have created a complete ODAG Scenario using the ODAG Wizard.
![Step_21a](../master/img/guide/Step_21a.png)
![Step_21b](../master/img/guide/Step_21b.png)