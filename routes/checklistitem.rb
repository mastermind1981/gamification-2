class Gamification < Sinatra::Application

  # Get all checklistitems
  #
  # return [Array] checklistitem objects
  get '/checklistitem' do
    if authorized?
      content_type :json
      @checklistitem = Checklistitem.all()
      status 200
      return @checklistitem.to_json
    else
      status 401
    end
  end

  # Get a checklistitem by id
  #
  # param [String] the checklistitem id
  #
  # return [Object] checklistitem
  get '/checklistitem/:id' do
    if authorized?
      content_type :json
      checklistitem = Checklistitem.find(params[:id])
      status 200
      return checklistitem.to_json
    else
      status 401
    end
  end

  # Get daily checklistitems by a class id and a user id
  #
  # param [String] the class id
  # param [String] the user id
  #
  # return [Object] checklistitem
  get '/checklistitem/daily/byclassid/:classid/:userid' do
    if authorized?
      content_type :json
      @checklistitem = Checklistitem.order_by(:_id.asc).where(:frequency => "daily")

      assignedChecklistitem = []
      @checklistitem.each do |checklistitem|
        if checklistitem.assignedclass.include?(params[:classid]) then

          if checklistitem.completedobjects.empty? then
            checklistitem["completed"] = false;
          else
            lessthanaday = false;

            completedobjects = Completedobject.where(:userId => params[:userid], :checklistitem_id => checklistitem._id)
            completedobjects.each do |completedobject|

              timecomp = Time.at(completedobject.finishedOn.to_i);
              todaytimecomp = Time.local(timecomp.year, timecomp.month, timecomp.day, 0,0,0).to_i

              diffsec = Time.now.to_i - todaytimecomp;
              if diffsec < 86400 && diffsec > 0 then
                lessthanaday = true;
                break;
              end
            end

            if lessthanaday
              checklistitem["completed"] = true;
            else
              checklistitem["completed"] = false;
            end
          end

          assignedChecklistitem << checklistitem;
        end
      end

      status 200
      return assignedChecklistitem.to_json
    else
      status 401
    end
  end

  # Get weekly checklistitems by a class id and a user id
  #
  # param [String] the class id
  # param [String] the user id
  #
  # return [Object] checklistitem
  get '/checklistitem/weekly/byclassid/:classid/:userid' do
    if authorized?
      content_type :json
      @checklistitem = Checklistitem.order_by(:_id.asc).where(:frequency => "weekly")

      assignedChecklistitem = []
      @checklistitem.each do |checklistitem|
        if checklistitem.assignedclass.include?(params[:classid]) then
          if checklistitem.completedobjects.empty? then
            checklistitem["completed"] = false;
          else
            lesthanaweek = false;

            completedobjects = Completedobject.where(:userId => params[:userid], :checklistitem_id => checklistitem._id)
            completedobjects.each do |completedobject|

              timecomp = Time.at(completedobject.finishedOn.to_i);
              mondytimecomp = timecomp.to_i - (86400 * (timecomp.strftime("%u").to_i - 1));

              diffsec = Time.now.to_i - mondytimecomp
              if diffsec < 604800 && diffsec > 0 then
                lesthanaweek = true;
                break;
              end
            end

            if lesthanaweek
              checklistitem["completed"] = true;
            else
              checklistitem["completed"] = false;
            end
          end

          assignedChecklistitem << checklistitem;
        end
      end

      status 200
      return assignedChecklistitem.to_json
    else
      status 401
    end
  end

  # Create a new checklistitem
  #
  # return [Object] checklistitem
  post '/checklistitem' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      checklistitem = Checklistitem.create()
      status 200
      return  checklistitem.to_json
    else
      status 401
    end
  end

  # Update a checklistitem by id
  #
  # param [String] the checklistitem id
  #
  # body [Object] in JSON. ex: {"description":"<String>", "frequency":"<String>(daily/weekly)" }
  #
  # return [Object] checklistitem
  put '/checklistitem/:id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      checklistitem = Checklistitem.find(params[:id])

      if checklistitem then
        data = JSON.parse request.body.read

        unless data['label'].nil?
          checklistitem.update_attributes(:label => data['label'])
          checklistitem.save
        end

        unless data['description'].nil?
          checklistitem.update_attributes(:description => data['description'])
          checklistitem.save
        end

        unless data['isnotificationitem'].nil?
          checklistitem.update_attributes(:isnotificationitem => data['isnotificationitem'])
          checklistitem.save
        end

        unless data['frequency'].nil?
          if data['frequency'] == 'daily' or data['frequency'] == 'weekly' then
            checklistitem.update_attributes(:frequency => data['frequency'])
            checklistitem.save
          else
            status 400
            return  {"error" => data['frequency']+" must be either 'daily' or 'weekly'"}.to_json
          end
        end

        status 200
        return  checklistitem.to_json
      else
        return {"error" => "ChecklistItem "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Add an assigned group to a checklistitem by id
  #
  # param [String] the quest id
  #
  # param [String] the level id
  #
  # return [Object] checklistitem
  put '/checklistitem/:id/addassignedclass/:classid' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      checklistitem = Checklistitem.find(params[:id])

      if checklistitem then

        begin
          classroom = Classroom.find(params[:classid])
        end

        if classroom
          checklistitem.assignedclass << params[:classid]
          checklistitem.save
        else
          status 500
          return {"error" => "Group "+params[:groupid]+" not found"}.to_json
        end

        status 200

        return  checklistitem.to_json
      else
        return {"error" => "Quest "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Add a completed student to a checklistitem by id
  #
  # param [String] the checklistitem id
  #
  # body [Object] in JSON. ex: {"userId":"<String>", "text":"<String>" }
  #
  # return [Object] checklistitem
  put '/checklistitem/:id/addcompletedstudent' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      checklistitem = Checklistitem.find(params[:id])

      if checklistitem then
        data = JSON.parse request.body.read

        unless data.nil? or data['userId'].nil? then
          begin
            student = Student.find(data['userId'])
          end

          if student
            completedobject = Completedobject.create(:text => data['text'], :userId => data['userId'], :finishedOn => Time.now);
            checklistitem.completedobjects << completedobject
            checklistitem.save

            student.update_attributes(:checklistcount => (student.checklistcount).to_i+1);
            student.save
            status 200
            return  student.to_json
          else
            status 500
            return {"error" => "Group "+data['groupId']+" not found"}.to_json
          end

        else
          status 500
          return {"error" => "Group id missing"}.to_json
        end
      else
        return {"error" => "ChecklistItem "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Delete a checklistitem by id
  #
  # param [String] the checklistitem id
  #
  # return [Object] message
  delete '/checklistitem/:id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      checklistitem = Checklistitem.find(params[:id])

      if checklistitem.destroy then
        status 200
        return {"message" => "ChecklistItem "+params[:id]+" deleted"}.to_json
      else
        status 500
        return {"error" => "ChecklistItem "+params[:id]+" not deleted"}.to_json
      end
    else
      status 401
      return {"error" => "Not authorised"}.to_json
    end
  end
end
