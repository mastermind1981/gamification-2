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

  # Get all the daily non-completed checklistitem for a user id
  #
  # param [String] the user id
  #
  # return [Object] checklistitem
  get '/checklistitem/daily/:id' do
    if authorized?
      content_type :json

      @daily = []

      @checklistitem = Checklistitem.where(:frequency => "daily")
      @checklistitem.each do|checklistitem|

        if checklistitem.completedobjects.empty? then
          @daily << checklistitem
        else
          olderthanaday = false;

          @completedobject = Completedobject.where(:userId => params[:id], :checklistitemId => checklistitem._id)
          @completedobject.each do |completedobject|
            diffsec = completedobject.finishedOn.to_i - daysec
            if diffsec < 86400 and diffsec > 0 then
              olderthanaday = true;
              break;
            end
          end

          unless olderthanaday
            @daily << checklistitem
          end
        end
      end

      status 200
      return @daily.to_json
    else
      status 401
    end
  end

  # Get all the weekly non-completed checklistitem for a user id
  #
  # param [String] the user id
  #
  # return [Object] checklistitem
  get '/checklistitem/weekly/:id' do
    if authorized?
      content_type :json

      @weekly = []

      @checklistitem = Checklistitem.where(:frequency => "weekly")
      @checklistitem.each do|checklistitem|

        if checklistitem.completedobjects.empty? then
          @weekly << checklistitem
        else
          olderthanaweek = false;

          @completedobject = Completedobject.where(:userId => params[:id], :checklistitemId => checklistitem._id)
          @completedobject.each do |completedobject|
            diffsec = completedobject.finishedOn.to_i - weeksec
            if diffsec < 604800 and diffsec > 0 then
              olderthanaweek = true;
              break;
            end
          end

          unless olderthanaweek
            @weekly << checklistitem
          end
        end
      end

      status 200
      return @weekly.to_json
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

        unless data['description'].nil?
          checklistitem.update_attributes(:description => data['description'])
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
            completedobject = Completedobject.create(:text => data['text'], :userId => data['userId'], :groupId => student.groupId, :finishedOn => Time.now);
            checklistitem.completedobjects << completedobject
            checklistitem.save
            status 200
            return  checklistitem.to_json
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
